.PHONY: build

build:
	docker build --build-arg ACTIONSFLOW_VERSION=latest --build-arg ACT_VERSION=latest -t actionsflow/actionsflow:latest .

.PHONY: start
start:
	docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/data -p 3000:3000 actionsflow/actionsflow

.PHONY: run
run:
	docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/data -p 3000:3000 actionsflow/actionsflow bash

.PHONY: push
push:	
	docker tag actionsflow/actionsflow:latest actionsflow/actionsflow:v1 && docker push actionsflow/actionsflow:v1