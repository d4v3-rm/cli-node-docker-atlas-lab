ARG BASE_IMAGE=ghcr.io/invoke-ai/invokeai:latest
FROM ${BASE_IMAGE}

ENV INVOKEAI_PYTHON=/opt/venv/bin/python

RUN ${INVOKEAI_PYTHON} -m ensurepip --upgrade \
    && ${INVOKEAI_PYTHON} -m pip install --no-cache-dir "huggingface_hub[hf_transfer]==0.34.6"

COPY infra/docker/images/model-sync/download-model.py /usr/local/bin/download-model.py
COPY infra/docker/images/invokeai/start-invokeai.sh /usr/local/bin/start-invokeai.sh
COPY infra/docker/images/invokeai/flux2_klein_model_loader.py /opt/invokeai/invokeai/app/invocations/flux2_klein_model_loader.py
COPY infra/docker/images/invokeai/z_image_model_loader.py /opt/invokeai/invokeai/app/invocations/z_image_model_loader.py

RUN chmod +x /usr/local/bin/start-invokeai.sh

ENTRYPOINT ["/usr/local/bin/start-invokeai.sh"]
