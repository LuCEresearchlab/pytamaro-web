FROM jupyter/base-notebook:x86_64-python-3.10
COPY . /home/jovyan/work/
USER root
RUN apt-get update && xargs apt-get install -y </home/jovyan/work/apt.txt
USER jovyan
RUN pip install -r /home/jovyan/work/requirements.txt

EXPOSE 8888

CMD ["sh", "-c", "start-notebook.sh --ServerApp.root_dir='/notebooks' --ServerApp.token=${JUPYTER_TOKEN}"]
