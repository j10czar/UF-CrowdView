FROM python:3.9-slim


WORKDIR /app


COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt


COPY . .


EXPOSE 5000


# use Gunicorn as the WSGI server
#  bind address 0.0.0.0 makes it accessible from outside the container
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
