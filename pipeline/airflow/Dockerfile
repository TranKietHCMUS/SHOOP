FROM apache/airflow:2.7.1-python3.10

USER root
RUN apt-get update && \
    apt-get install -y git && \
    apt-get install -y libgomp1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER airflow

# Upgrade pip
RUN pip install --upgrade pip

# Cài provider chính thức thay vì bản fork (để tránh lỗi version)
RUN pip install airflow-provider-great-expectations

# Cài provider OpenLineage (có version rõ ràng)
RUN pip install apache-airflow-providers-openlineage>=1.8.0

# Copy và cài requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
