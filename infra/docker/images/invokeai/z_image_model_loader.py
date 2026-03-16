"""Patched Z-Image model loader with Atlas Lab fallback discovery."""

from typing import Optional

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
    ModelFormat,
    ModelType,
    Qwen3VariantType,
    SubModelType,
)


@invocation_output("z_image_model_loader_output")
class ZImageModelLoaderOutput(BaseInvocationOutput):
    """Z-Image base model loader output."""

    transformer: TransformerField = OutputField(description=FieldDescriptions.transformer, title="Transformer")
    qwen3_encoder: Qwen3EncoderField = OutputField(description=FieldDescriptions.qwen3_encoder, title="Qwen3 Encoder")
    vae: VAEField = OutputField(description=FieldDescriptions.vae, title="VAE")


@invocation(
    "z_image_model_loader",
    title="Main Model - Z-Image",
    tags=["model", "z-image"],
    category="model",
    version="3.0.0",
    classification=Classification.Prototype,
)
class ZImageModelLoaderInvocation(BaseInvocation):
    """Loads a Z-Image model, outputting its submodels."""

    model: ModelIdentifierField = InputField(
        description=FieldDescriptions.z_image_model,
        input=Input.Direct,
        ui_model_base=BaseModelType.ZImage,
        ui_model_type=ModelType.Main,
        title="Transformer",
    )

    vae_model: Optional[ModelIdentifierField] = InputField(
        default=None,
        description="Standalone VAE model. Z-Image uses the same VAE as FLUX (16-channel). "
        "If not provided, VAE will be loaded from the Qwen3 Source model.",
        input=Input.Direct,
        ui_model_base=BaseModelType.Flux,
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
        description="Diffusers Z-Image model to extract VAE and/or Qwen3 encoder from. "
        "Use this if you don't have separate VAE/Qwen3 models. "
        "Ignored if both VAE and Qwen3 Encoder are provided separately.",
        input=Input.Direct,
        ui_model_base=BaseModelType.ZImage,
        ui_model_type=ModelType.Main,
        ui_model_format=ModelFormat.Diffusers,
        title="Qwen3 Source (Diffusers)",
    )

    def invoke(self, context: InvocationContext) -> ZImageModelLoaderOutput:
        transformer = self.model.model_copy(update={"submodel_type": SubModelType.Transformer})

        vae_source = self.vae_model
        if vae_source is None and self.qwen3_source_model is None:
            vae_source = self._find_default_vae(context)
            if vae_source is not None:
                context.logger.info(f"Auto-selected VAE '{vae_source.name}' for Z-Image model '{self.model.name}'")

        if vae_source is not None:
            vae = vae_source.model_copy(update={"submodel_type": SubModelType.VAE})
        elif self.qwen3_source_model is not None:
            self._validate_diffusers_format(context, self.qwen3_source_model, "Qwen3 Source")
            vae = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.VAE})
        else:
            raise ValueError(
                "No VAE source provided. Either set 'VAE' to a FLUX VAE model, "
                "or set 'Qwen3 Source' to a Diffusers Z-Image model."
            )

        qwen3_source = self.qwen3_encoder_model
        if qwen3_source is None and self.qwen3_source_model is None:
            qwen3_source = self._find_default_qwen3_encoder(context)
            if qwen3_source is not None:
                context.logger.info(
                    f"Auto-selected Qwen3 encoder '{qwen3_source.name}' for Z-Image model '{self.model.name}'"
                )

        if qwen3_source is not None:
            qwen3_tokenizer = qwen3_source.model_copy(update={"submodel_type": SubModelType.Tokenizer})
            qwen3_encoder = qwen3_source.model_copy(update={"submodel_type": SubModelType.TextEncoder})
        elif self.qwen3_source_model is not None:
            self._validate_diffusers_format(context, self.qwen3_source_model, "Qwen3 Source")
            qwen3_tokenizer = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.Tokenizer})
            qwen3_encoder = self.qwen3_source_model.model_copy(update={"submodel_type": SubModelType.TextEncoder})
        else:
            raise ValueError(
                "No Qwen3 Encoder source provided. Either set 'Qwen3 Encoder' to a standalone model, "
                "or set 'Qwen3 Source' to a Diffusers Z-Image model."
            )

        return ZImageModelLoaderOutput(
            transformer=TransformerField(transformer=transformer, loras=[]),
            qwen3_encoder=Qwen3EncoderField(tokenizer=qwen3_tokenizer, text_encoder=qwen3_encoder),
            vae=VAEField(vae=vae),
        )

    def _find_default_vae(self, context: InvocationContext) -> Optional[ModelIdentifierField]:
        candidates = context.models.search_by_attrs(type=ModelType.VAE)
        if not candidates:
            return None

        preferred = sorted(
            candidates,
            key=lambda config: (
                0 if "z-image" in config.name.lower() else 1,
                0 if "ae" in config.name.lower() else 1,
                0 if "flux" in config.name.lower() else 1,
                config.name.lower(),
            ),
        )[0]
        return ModelIdentifierField.from_config(preferred)

    def _find_default_qwen3_encoder(self, context: InvocationContext) -> Optional[ModelIdentifierField]:
        candidates = context.models.search_by_attrs(type=ModelType.Qwen3Encoder)
        matching = []
        for config in candidates:
            model_variant = getattr(config, "variant", None)
            if model_variant == Qwen3VariantType.Qwen3_4B or (
                model_variant is None and "4b" in config.name.lower()
            ):
                matching.append(config)

        if not matching:
            return None

        preferred = sorted(
            matching,
            key=lambda config: (
                0 if "z-image" in config.name.lower() else 1,
                0 if "qwen3" in config.name.lower() else 1,
                config.name.lower(),
            ),
        )[0]
        return ModelIdentifierField.from_config(preferred)

    def _validate_diffusers_format(
        self, context: InvocationContext, model: ModelIdentifierField, model_name: str
    ) -> None:
        config = context.models.get_config(model)
        if config.format != ModelFormat.Diffusers:
            raise ValueError(
                f"The {model_name} model must be a Diffusers format Z-Image model. "
                f"The selected model '{config.name}' is in {config.format.value} format."
            )
