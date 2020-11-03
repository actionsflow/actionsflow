.PHONY: build

build:
	docker build --build-arg ACTIONSFLOW_VERSION=beta -t actionsflow/actionsflow:latest .

start:
	docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/data -p 3000:3000 actionsflow/actionsflow actionsflow start