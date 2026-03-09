ARG BASE_IMAGE=ghcr.io/invoke-ai/invokeai:latest
FROM ${BASE_IMAGE}

RUN /opt/venv/bin/pip install --no-cache-dir "huggingface_hub[hf_transfer]==0.34.6"

COPY infra/docker/images/model-sync/download-model.py /usr/local/bin/download-model.py
COPY infra/docker/images/invokeai/start-invokeai.sh /usr/local/bin/start-invokeai.sh

RUN chmod +x /usr/local/bin/start-invokeai.sh

ENTRYPOINT ["/usr/local/bin/start-invokeai.sh"]
