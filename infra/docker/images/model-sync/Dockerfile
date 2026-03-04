FROM python:3.12-slim

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir "huggingface_hub[hf_transfer]==0.34.6"

COPY infra/docker/images/model-sync/download-model.py /usr/local/bin/download-model.py

ENTRYPOINT ["python", "/usr/local/bin/download-model.py"]
