"""Patched FLUX.2 Klein model loader with Atlas Lab fallback discovery."""

from typing import Literal, Optional

from invokeai.app.invocations.baseinvocation import (
    BaseInvocation,
    BaseInvocationOutput,
    Classification,
    invocation,
    invocation_output,
)
from invokeai.app.invocations.fields import FieldDescriptions, Input, InputField, OutputField
from invokeai.app.invocations.model import (
    ModelIdentifierField,
    Qwen3EncoderField,
    TransformerField,
    VAEField,
)
from invokeai.app.services.shared.invocation_context import InvocationContext
from invokeai.backend.model_manager.taxonomy import (
    BaseModelType,
    Flux2VariantType,
    ModelFormat,
    ModelType,
    Qwen3VariantType,
    SubModelType,
)


@invocation_output("flux2_klein_model_loader_output")
class Flux2KleinModelLoaderOutput(BaseInvocationOutput):
    """Flux2 Klein model loader output."""

    transformer: TransformerField = OutputField(description=FieldDescriptions.transformer, title="Transformer")
    qwen3_encoder: Qwen3EncoderField = OutputField(description=FieldDescriptions.qwen3_encoder, title="Qwen3 Encoder")
    vae: VAEField = OutputField(description=FieldDescriptions.vae, title="VAE")
    max_seq_len: Literal[256, 512] = OutputField(
        description="The max sequence length for the Qwen3 encoder.",
        title="Max Seq Length",
    )


@invocation(
    "flux2_klein_model_loader",
    title="Main Model - Flux2 Klein",
    tags=["model", "flux", "klein", "qwen3"],
    category="model",
    version="1.0.0",
    classification=Classification.Prototype,
)
class Flux2KleinModelLoaderInvocation(BaseInvocation):
    """Loads a Flux2 Klein model, outputting its submodels."""

    model: ModelIdentifierField = InputField(
        description=FieldDescriptions.flux_model,
        input=Input.Direct,
        ui_model_base=BaseModelType.Flux2,
        ui_model_type=ModelType.Main,
        title="Transformer",
    )

    vae_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="Standalone VAE model. Flux2 Klein uses the same VAE as FLUX (16-channel). "
        "If not provided, VAE will be loaded from the Qwen3 Source model.",
        input=Input.Direct,
        ui_model_base=[BaseModelType.Flux, BaseModelType.Flux2],
        ui_model_type=ModelType.VAE,
        title="VAE",
    )

    qwen3_encoder_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="Standalone Qwen3 Encoder model. "
        "If not provided, encoder will be loaded from the Qwen3 Source model.",
        input=Input.Direct,
        ui_model_type=ModelType.Qwen3Encoder,
        title="Qwen3 Encoder",
    )

    qwen3_source_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="Diffusers Flux2 Klein model to extract VAE and/or Qwen3 encoder from. "
        "Use this if you don't have separate VAE/Qwen3 models. "
        "Ignored if both VAE and Qwen3 Encoder are provided separately.",
        input=Input.Direct,
        ui_model_base=BaseModelType.Flux2,
        ui_model_type=ModelType.Main,
        ui_model_format=ModelFormat.Diffusers,
        title="Qwen3 Source (Diffusers)",
    )

    max_seq_len: Literal[256, 512] = InputField(
        default=512,
        description="Max sequence length for the Qwen3 encoder.",
        title="Max Seq Length",
    )

    def invoke(self, context: InvocationContext) -> Flux2KleinModelLoaderOutput:
        transformer = self.model.model_copy(update={"submodel_type": SubModelType.Transformer})

        main_config = context.models.get_config(self.model)
        main_is_diffusers = main_config.format == ModelFormat.Diffusers

        vae_source = self.vae_model
        if vae_source is None and not main_is_diffusers and self.qwen3_source_model is None:
            vae_source = self._find_default_flux2_vae(context)
            if vae_source is not None:
                context.logger.info(f"Auto-selected FLUX.2 VAE '{vae_source.name}' for '{main_config.name}'")

        if vae_source is not None:
            vae = vae_source.model_copy(update={"submodel_type": SubModelType.VAE})
        elif main_is_diffusers:
            vae = self.model.model_copy(update={"submodel_type": SubModelType.VAE})
        elif self.qwen3_source_model is not None:
            self._validate_diffusers_format(context, self.qwen3_source_model, "Qwen3 Source")
            vae = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.VAE})
        else:
            raise ValueError(
                "No VAE source provided. Standalone safetensors/GGUF models require a separate VAE. "
                "Options:\n"
                "  1. Set 'VAE' to a standalone FLUX VAE model\n"
                "  2. Set 'Qwen3 Source' to a Diffusers Flux2 Klein model to extract the VAE from"
            )

        qwen3_source = self.qwen3_encoder_model
        if qwen3_source is None and not main_is_diffusers and self.qwen3_source_model is None:
            qwen3_source = self._find_default_qwen3_encoder(context, main_config)
            if qwen3_source is not None:
                context.logger.info(f"Auto-selected Qwen3 encoder '{qwen3_source.name}' for '{main_config.name}'")

        if qwen3_source is not None:
            self._validate_qwen3_encoder_variant(context, main_config, qwen3_source)
            qwen3_tokenizer = qwen3_source.model_copy(update={"submodel_type": SubModelType.Tokenizer})
            qwen3_encoder = qwen3_source.model_copy(update={"submodel_type": SubModelType.TextEncoder})
        elif main_is_diffusers:
            qwen3_tokenizer = self.model.model_copy(update={"submodel_type": SubModelType.Tokenizer})
            qwen3_encoder = self.model.model_copy(update={"submodel_type": SubModelType.TextEncoder})
        elif self.qwen3_source_model is not None:
            self._validate_diffusers_format(context, self.qwen3_source_model, "Qwen3 Source")
            qwen3_tokenizer = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.Tokenizer})
            qwen3_encoder = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.TextEncoder})
        else:
            raise ValueError(
                "No Qwen3 Encoder source provided. Standalone safetensors/GGUF models require a separate text encoder. "
                "Options:\n"
                "  1. Set 'Qwen3 Encoder' to a standalone Qwen3 text encoder model "
                "(Klein 4B needs Qwen3 4B, Klein 9B needs Qwen3 8B)\n"
                "  2. Set 'Qwen3 Source' to a Diffusers Flux2 Klein model to extract the encoder from"
            )

        return Flux2KleinModelLoaderOutput(
            transformer=TransformerField(transformer=transformer, loras=[]),
            qwen3_encoder=Qwen3EncoderField(tokenizer=qwen3_tokenizer, text_encoder=qwen3_encoder),
            vae=VAEField(vae=vae),
            max_seq_len=self.max_seq_len,
        )

    def _find_default_flux2_vae(self, context: InvocationContext) -> Optional[ModelIdentifierField]:
        candidates = context.models.search_by_attrs(type=ModelType.VAE)
        if not candidates:
            return None

        preferred = sorted(
            candidates,
            key=lambda config: (
                0 if "flux.2" in config.name.lower() else 1,
                0 if "vae" in config.name.lower() else 1,
                0 if "flux" in config.name.lower() else 1,
                config.name.lower(),
            ),
        )[0]
        return ModelIdentifierField.from_config(preferred)

    def _find_default_qwen3_encoder(
        self, context: InvocationContext, main_config
    ) -> Optional[ModelIdentifierField]:
        expected_variant = self._get_expected_qwen3_variant(main_config)
        candidates = context.models.search_by_attrs(type=ModelType.Qwen3Encoder)

        matching = []
        for config in candidates:
            model_variant = getattr(config, "variant", None)
            if expected_variant is None or model_variant == expected_variant:
                matching.append(config)
                continue

            if model_variant is None and self._matches_qwen3_variant_by_name(config.name, expected_variant):
                matching.append(config)

        if not matching:
            return None

        preferred = sorted(
            matching,
            key=lambda config: (
                0 if "flux.2 klein" in config.name.lower() else 1,
                0 if "qwen3" in config.name.lower() else 1,
                0 if "4b" in config.name.lower() else 1,
                config.name.lower(),
            ),
        )[0]
        return ModelIdentifierField.from_config(preferred)

    def _matches_qwen3_variant_by_name(
        self, model_name: str, expected_variant: Optional[Qwen3VariantType]
    ) -> bool:
        normalized_name = model_name.lower()
        if expected_variant == Qwen3VariantType.Qwen3_4B:
            return "4b" in normalized_name
        if expected_variant == Qwen3VariantType.Qwen3_8B:
            return "8b" in normalized_name or "9b" in normalized_name
        return False

    def _validate_diffusers_format(
        self, context: InvocationContext, model: ModelIdentifierField, model_name: str
    ) -> None:
        config = context.models.get_config(model)
        if config.format != ModelFormat.Diffusers:
            raise ValueError(
                f"The {model_name} model must be a Diffusers format model. "
                f"The selected model '{config.name}' is in {config.format.value} format."
            )

    def _get_expected_qwen3_variant(self, main_config):
        if not hasattr(main_config, "variant"):
            return None

        flux2_variant = main_config.variant
        if flux2_variant == Flux2VariantType.Klein4B:
            return Qwen3VariantType.Qwen3_4B
        if flux2_variant in (Flux2VariantType.Klein9B, Flux2VariantType.Klein9BBase):
            return Qwen3VariantType.Qwen3_8B
        return None

    def _validate_qwen3_encoder_variant(
        self, context: InvocationContext, main_config, qwen3_encoder_model: Optional[ModelIdentifierField] = None
    ) -> None:
        candidate = qwen3_encoder_model or self.qwen3_encoder_model
        if candidate is None:
            return

        qwen3_config = context.models.get_config(candidate)
        if not hasattr(qwen3_config, "variant") or not hasattr(main_config, "variant"):
            return

        expected_qwen3_variant = self._get_expected_qwen3_variant(main_config)
        if expected_qwen3_variant is None:
            return

        if qwen3_config.variant != expected_qwen3_variant:
            raise ValueError(
                f"Qwen3 encoder variant mismatch: FLUX.2 Klein {main_config.variant.value} requires "
                f"{expected_qwen3_variant.value} encoder, but {qwen3_config.variant.value} was selected. "
                f"Please select a matching Qwen3 encoder or use a Diffusers format model which includes the correct encoder."
            )
