ARG BASE_IMAGE=pytorch/pytorch:2.7.1-cuda12.6-cudnn9-runtime
FROM ${BASE_IMAGE}

ARG COMFYUI_REPO=https://github.com/Comfy-Org/ComfyUI.git
ARG COMFYUI_REVISION=v0.16.4

ENV HF_HUB_ENABLE_HF_TRANSFER=1
ENV PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      ffmpeg \
      git \
      libgl1 \
      libglib2.0-0 \
      wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

RUN git clone "${COMFYUI_REPO}" /opt/ComfyUI \
    && cd /opt/ComfyUI \
    && git checkout "${COMFYUI_REVISION}" \
    && python -m pip install --upgrade pip \
    && python -m pip install "huggingface_hub[hf_transfer]==0.34.6" \
    && python -m pip install -r requirements.txt

COPY infra/docker/images/comfyui/start-comfyui.sh /usr/local/bin/start-comfyui.sh

RUN chmod +x /usr/local/bin/start-comfyui.sh

WORKDIR /opt/ComfyUI

ENTRYPOINT ["/usr/local/bin/start-comfyui.sh"]
