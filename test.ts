function f() {
    switch (returnData.taskType) {
        case WorkerTaskType.INIT:
            this._init = true;
            this._scene.meshes.forEach((mesh) => {
                this.onMeshAdded(mesh);
            });

            this._scene.getGeometries().forEach((geometry) => {
                this.onGeometryAdded(geometry);
            });

            break;
        case WorkerTaskType.UPDATE:
            this._runningUpdated--;
            break;
        case WorkerTaskType.COLLIDE:
            var returnPayload: CollisionReplyPayload = returnData.payload;
            if (!this._collisionsCallbackArray[returnPayload.collisionId]) return;

            let callback = this._collisionsCallbackArray[returnPayload.collisionId];

            if (callback) {
                let mesh = this._scene.getMeshByUniqueID(returnPayload.collidedMeshUniqueId);

                if (mesh) {
                    callback(returnPayload.collisionId, Vector3.FromArray(returnPayload.newPosition), mesh);
                }
            }

            this._collisionsCallbackArray[returnPayload.collisionId] = null;
            break;
    }
}