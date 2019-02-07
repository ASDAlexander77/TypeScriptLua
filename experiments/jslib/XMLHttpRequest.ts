declare var io: any;

module JS {

    export class XMLHttpRequest {
        static readonly UNSENT = 0;
        static readonly OPENED = 1;
        static readonly HEADERS_RECEIVED = 2;
        static readonly LOADING = 3;
        static readonly DONE = 4;

        public readyState: number;
        public responseType: string;
        public status: number;
        public statusText: string;
        public responseText: string;

        private callbacks: Map<any>;
        private url: string;

        public open(method: string, url: string, asyncType: boolean) {
            this.url = url;
            this.readyState = XMLHttpRequest.OPENED;
        }

        public addEventListener(eventName: string, cb: any, flag?: boolean): void {
            if (!this.callbacks) {
                this.callbacks = {};
            }

            this.callbacks[eventName] = cb;
        }

        public removeEventListener(eventName: string, cb: any, flag?: boolean): void {
            if (!this.callbacks) {
                return;
            }

            delete this.callbacks[eventName];
        }

        public send(body?: string) {
            this.readyState = XMLHttpRequest.LOADING;
            const file = table.pack(io.open(this.url, 'r'));
            if (file[1]) {
                const data = file[1].read('*all');
                this.responseText = string.gsub(data, '^\xef\xbb\xbf', '');
                this.status = 200;
            } else {
                this.status = 404;
                this.statusText = file[2];
            }

            this.readyState = XMLHttpRequest.DONE;

            const readystatechangeCallback = this.callbacks['readystatechange'];
            if (readystatechangeCallback) {
                readystatechangeCallback();
            }

            const loadendCallback = this.callbacks['loadend'];
            if (loadendCallback) {
                loadendCallback();
            }
        }
    }

}
