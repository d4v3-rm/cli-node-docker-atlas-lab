ARG BASE_IMAGE
FROM ${BASE_IMAGE}

USER root

ARG PYTHON_VERSION
ARG INSTALL_PACKAGES
ARG PYTHON_PIP_PACKAGES
ARG PIP_INDEX_URL
ARG PIP_EXTRA_INDEX_URL

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev \
    ${INSTALL_PACKAGES} && \
  rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/pyenv/pyenv.git /opt/pyenv

ENV PYENV_ROOT=/opt/pyenv
ENV PATH="$PYENV_ROOT/bin:$PYENV_ROOT/shims:$PATH"

RUN pyenv install "${PYTHON_VERSION}" && \
  pyenv global "${PYTHON_VERSION}" && \
  python -m pip install --upgrade pip setuptools wheel

RUN if [ -n "${PYTHON_PIP_PACKAGES}" ]; then \
    if [ -n "${PIP_INDEX_URL}" ]; then \
      pip install --index-url "${PIP_INDEX_URL}" ${PYTHON_PIP_PACKAGES}; \
    elif [ -n "${PIP_EXTRA_INDEX_URL}" ]; then \
      pip install --extra-index-url "${PIP_EXTRA_INDEX_URL}" ${PYTHON_PIP_PACKAGES}; \
    else \
      pip install ${PYTHON_PIP_PACKAGES}; \
    fi; \
  fi

COPY start-python-dev.sh /usr/local/bin/start-python-dev.sh
RUN chmod +x /usr/local/bin/start-python-dev.sh

USER 1000
WORKDIR /workspace

ENTRYPOINT ["/usr/local/bin/start-python-dev.sh"]
