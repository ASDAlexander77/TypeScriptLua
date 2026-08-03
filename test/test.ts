    class InternalPromise<T> {
        private _moveChildren(children: InternalPromise<T>[]): void {
            this._children.push(...children.splice(0, children.length));
        }
    }
