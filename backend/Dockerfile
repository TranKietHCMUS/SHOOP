# Stage 1: Builder
FROM python:3.12-slim AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các dependencies cần thiết
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Sao chép file requirements.txt vào container và cài đặt các gói
COPY requirements.txt .
RUN python -m venv /opt/venv
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt runtime dependencies tối thiểu
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy virtual environment từ builder stage
COPY --from=builder /opt/venv /opt/venv

# Thiết lập PATH để sử dụng virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Sao chép mã nguồn vào container
COPY . .

# Thêm user không quyền root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose cổng dịch vụ
EXPOSE 5000

# Lệnh chạy ứng dụng
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "--timeout", "120", "--access-logfile", "-", "app:app"]