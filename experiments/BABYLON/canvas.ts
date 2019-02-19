// @ts-ignore
import _gl from 'webgl';

declare var window: any;

// @ts-ignore
export default class Canvas extends _gl implements WebGLRenderingContext {

    canvas: HTMLCanvasElement;

    // @ts-ignore
    constructor() {
        /* init GL */
        _gl.init();
        // @ts-ignore
        this.canvas = <HTMLCanvasElement><any>this;
    }

    get drawingBufferWidth(): number {
        return window.innerWidth;
    }

    get drawingBufferHeight(): number {
        return window.innerHeight;
    }

    getBoundingClientRect() {
        return {
            bottom: window.innerHeight,
            height: window.innerHeight,
            left: 0,
            right: window.innerWidth,
            top: 0,
            width: window.innerWidth
        };
    }

    focus() {
        // no action
    }

    // @ts-ignore
    addEventListener(eventName: string, cb: any, flag: boolean): void {
        window.addEventListener(eventName, cb, flag);
    }

    // @ts-ignore
    drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttribDivisor(index: number, divisor: number): void {
        throw new Error('Method not implemented.');
    }

    createVertexArray(): WebGLVertexArrayObject {
        const val = _gl.createVertexArray();
        if (val >= 0) {
            return <WebGLVertexArrayObject>{ value: val };
        }

        return null;
    }

    bindVertexArray(vao?: WebGLVertexArrayObject): void {
        _gl.bindVertexArray(vao ? (<any>vao).value : 0);
    }

    // @ts-ignore
    deleteVertexArray(vao: WebGLVertexArrayObject): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number,
        // @ts-ignore
        dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    renderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindBufferBase(target: number, index: number, buffer: WebGLBuffer): void {
        _gl.bindBufferBase(target, index, buffer ? (<any>buffer).value : 0);
    }

    getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number {
        return _gl.getUniformBlockIndex(program ? (<any>program).value : 0, uniformBlockName);
    }

    uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBindingValue: number): void {
        _gl.uniformBlockBinding(program ? (<any>program).value : 0, uniformBlockIndex, uniformBlockBindingValue);
    }

    // @ts-ignore
    createQuery(): WebGLQuery {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteQuery(query: WebGLQuery): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    beginQuery(target: number, query: WebGLQuery): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    endQuery(target: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getQueryParameter(query: WebGLQuery, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getQuery(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    drawBuffers(buffers: number[]): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    readBuffer(src: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        depth: number, border: number, format: number, type: number, pixels: ArrayBufferView, offset?: number): void;
    // @ts-ignore
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        depth: number, border: number, format: number, type: number,
        pixels: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    // @ts-ignore
    texImage3D(target: any, level: any, internalformat: any, width: any, height: any, depth: any, border: any,
        // @ts-ignore
        format: any, type: any, pixels: any, offset?: any) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        // @ts-ignore
        depth: number, border: number, data: ArrayBufferView, offset?: number, length?: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    createTransformFeedback(): WebGLTransformFeedback {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteTransformFeedback(transformFeedbac: WebGLTransformFeedback): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindTransformFeedback(target: number, transformFeedback: WebGLTransformFeedback): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    beginTransformFeedback(primitiveMode: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    endTransformFeedback(): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    transformFeedbackVaryings(program: WebGLProgram, varyings: string[], bufferMode: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    clearBufferfv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    clearBufferiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    clearBufferuiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    activeTexture(texture: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    attachShader(program: WebGLProgram, shader: WebGLShader): void {
        _gl.attachShader(program ? (<any>program).value : 0, shader ? (<any>shader).value : 0);
    }

    // @ts-ignore
    bindAttribLocation(program: WebGLProgram, index: number, name: string): void {
        throw new Error('Method not implemented.');
    }

    bindBuffer(target: number, buffer: WebGLBuffer): void {
        _gl.bindBuffer(target, buffer ? (<any>buffer).value : 0);
    }

    // @ts-ignore
    bindFramebuffer(target: number, framebuffer: WebGLFramebuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindRenderbuffer(target: number, renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindTexture(target: number, texture: WebGLTexture): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blendColor(red: number, green: number, blue: number, alpha: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blendEquation(mode: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blendEquationSeparate(modeRGB: number, modeAlpha: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blendFunc(sfactor: number, dfactor: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    blendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void {
        throw new Error('Method not implemented.');
    }

    bufferData(target: number, sizeOrData: number | BufferSource, usage: number): void;
    bufferData(target: any, data: any, usage: any) {
        _gl.bufferData(target, data.buffer.bufferNativeInstance, usage);
    }

    bufferSubData(target: number, offset: number, data: BufferSource): void {
        _gl.bufferSubData(target, offset, (<any>data).buffer.bufferNativeInstance);
    }

    // @ts-ignore
    checkFramebufferStatus(target: number): number {
        throw new Error('Method not implemented.');
    }

    clear(mask: number): void {
        _gl.clear(mask);
    }

    clearColor(red: number, green: number, blue: number, alpha: number): void {
        _gl.clearColor(red, green, blue, alpha);
    }

    clearDepth(depth: number): void {
        _gl.clearDepth(depth);
    }

    clearStencil(s: number): void {
        _gl.clearStencil(s);
    }

    // @ts-ignore
    colorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {
        throw new Error('Method not implemented.');
    }

    compileShader(shader: WebGLShader): void {
        _gl.compileShader((<any>shader).value);
    }

    // @ts-ignore
    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number,
        // @ts-ignore
        border: number, data: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number,
        // @ts-ignore
        height: number, format: number, data: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    copyTexImage2D(target: number, level: number, internalformat: number, x: number, y: number, width: number,
        // @ts-ignore
        height: number, border: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    copyTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number,
        // @ts-ignore
        width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    createBuffer(): WebGLBuffer {
        const val = _gl.createBuffer();
        if (val >= 0) {
            return <WebGLBuffer><any>{ value: val };
        }

        return null;
    }

    // @ts-ignore
    createFramebuffer(): WebGLFramebuffer {
        throw new Error('Method not implemented.');
    }

    createProgram(): WebGLProgram {
        const val = _gl.createProgram();
        if (val >= 0) {
            return <WebGLProgram>{ value: val };
        }

        return null;
    }

    // @ts-ignore
    createRenderbuffer(): WebGLRenderbuffer {
        throw new Error('Method not implemented.');
    }

    createShader(type: number): WebGLShader {
        const val = _gl.createShader(type);
        if (val >= 0) {
            return <WebGLShader>{ value: val, type: type };
        }

        return null;
    }

    // @ts-ignore
    createTexture(): WebGLTexture {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    cullFace(mode: number): void {
        _gl.cullFace(mode);
    }

    // @ts-ignore
    deleteBuffer(buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteFramebuffer(framebuffer: WebGLFramebuffer): void {
        throw new Error('Method not implemented.');
    }

    deleteProgram(program: WebGLProgram): void {
        _gl.deleteProgram(program ? (<any>program).value : 0);
    }

    // @ts-ignore
    deleteRenderbuffer(renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    deleteShader(shader: WebGLShader): void {
        _gl.deleteShader(shader ? (<any>shader).value : 0);
    }

    // @ts-ignore
    deleteTexture(texture: WebGLTexture): void {
        throw new Error('Method not implemented.');
    }

    depthFunc(func: number): void {
        _gl.depthFunc(func);
    }

    depthMask(flag: boolean): void {
        _gl.depthMask(flag);
    }

    // @ts-ignore
    depthRange(zNear: number, zFar: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    detachShader(program: WebGLProgram, shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    disable(cap: number): void {
        _gl.disable(cap);
    }

    disableVertexAttribArray(index: number): void {
        _gl.disableVertexAttribArray(index);
    }

    // @ts-ignore
    drawArrays(mode: number, first: number, count: number): void {
        throw new Error('Method not implemented.');
    }

    drawElements(mode: number, count: number, type: number, offset: number): void {
        _gl.drawElements(mode, count, type, offset);
    }

    enable(cap: number): void {
        _gl.enable(cap);
    }

    enableVertexAttribArray(index: number): void {
        _gl.enableVertexAttribArray(index);
    }

    // @ts-ignore
    finish(): void {
        throw new Error('Method not implemented.');
    }

    flush(): void {
        _gl.flush();
    }

    // @ts-ignore
    framebufferRenderbuffer(target: number, attachment: number, renderbuffertarget: number, renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    framebufferTexture2D(target: number, attachment: number, textarget: number, texture: WebGLTexture, level: number): void {
        throw new Error('Method not implemented.');
    }

    frontFace(mode: number): void {
        _gl.frontFace(mode);
    }

    // @ts-ignore
    generateMipmap(target: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getActiveAttrib(program: WebGLProgram, index: number): WebGLActiveInfo {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getActiveUniform(program: WebGLProgram, index: number): WebGLActiveInfo {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getAttachedShaders(program: WebGLProgram): WebGLShader[] {
        throw new Error('Method not implemented.');
    }

    getAttribLocation(program: WebGLProgram, name: string): number {
        return _gl.getAttribLocation(program ? (<any>program).value : 0, name);
    }

    // @ts-ignore
    getBufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getContextAttributes(): WebGLContextAttributes {
        // TODO: finish it
        return undefined;
    }

    getError(): number {
        return _gl.error();
    }

    // @ts-ignore
    getExtension(extensionName: 'EXT_blend_minmax'): EXT_blend_minmax;
    // @ts-ignore
    getExtension(extensionName: 'EXT_texture_filter_anisotropic'): EXT_texture_filter_anisotropic;
    // @ts-ignore
    getExtension(extensionName: 'EXT_frag_depth'): EXT_frag_depth;
    // @ts-ignore
    getExtension(extensionName: 'EXT_shader_texture_lod'): EXT_shader_texture_lod;
    // @ts-ignore
    getExtension(extensionName: 'EXT_sRGB'): EXT_sRGB;
    // @ts-ignore
    getExtension(extensionName: 'OES_vertex_array_object'): OES_vertex_array_object;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_color_buffer_float'): WEBGL_color_buffer_float;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_compressed_texture_astc'): WEBGL_compressed_texture_astc;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_compressed_texture_s3tc_srgb'): WEBGL_compressed_texture_s3tc_srgb;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_debug_shaders'): WEBGL_debug_shaders;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_draw_buffers'): WEBGL_draw_buffers;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_lose_context'): WEBGL_lose_context;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_depth_texture'): WEBGL_depth_texture;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_debug_renderer_info'): WEBGL_debug_renderer_info;
    // @ts-ignore
    getExtension(extensionName: 'WEBGL_compressed_texture_s3tc'): WEBGL_compressed_texture_s3tc;
    // @ts-ignore
    getExtension(extensionName: 'OES_texture_half_float_linear'): OES_texture_half_float_linear;
    // @ts-ignore
    getExtension(extensionName: 'OES_texture_half_float'): OES_texture_half_float;
    // @ts-ignore
    getExtension(extensionName: 'OES_texture_float_linear'): OES_texture_float_linear;
    // @ts-ignore
    getExtension(extensionName: 'OES_texture_float'): OES_texture_float;
    // @ts-ignore
    getExtension(extensionName: 'OES_standard_derivatives'): OES_standard_derivatives;
    // @ts-ignore
    getExtension(extensionName: 'OES_element_index_uint'): OES_element_index_uint;
    // @ts-ignore
    getExtension(extensionName: 'ANGLE_instanced_arrays'): ANGLE_instanced_arrays;
    // @ts-ignore
    getExtension(extensionName: string | any): any {
        // TODO: finish it
        return null;
    }

    // @ts-ignore
    getFramebufferAttachmentParameter(target: number, attachment: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getParameter(pname: number) {
        return _gl.getParameter(pname);
    }

    // @ts-ignore
    getProgramInfoLog(program: WebGLProgram): string {
        return _gl.getProgramInfoLog(program ? (<any>program).value : 0);
    }

    getProgramParameter(program: WebGLProgram, pname: number) {
        return _gl.getProgramParameter(program ? (<any>program).value : 0, pname);
    }

    // @ts-ignore
    getRenderbufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getShaderInfoLog(shader: WebGLShader): string {
        return _gl.getShaderInfoLog(shader ? (<any>shader).value : 0);
    }

    getShaderParameter(shader: WebGLShader, pname: number) {
        return _gl.getShaderParameter(shader ? (<any>shader).value : 0, pname);
    }

    getShaderPrecisionFormat(shadertype: number, precisiontype: number): WebGLShaderPrecisionFormat {
        return _gl.getShaderPrecisionFormat(shadertype, precisiontype);
    }

    // @ts-ignore
    getShaderSource(shader: WebGLShader): string {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getSupportedExtensions(): string[] {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getTexParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getUniform(program: WebGLProgram, location: WebGLUniformLocation) {
        throw new Error('Method not implemented.');
    }

    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation {
        const val = _gl.getUniformLocation(program ? (<any>program).value : 0, name);
        if (val >= 0) {
            return <WebGLUniformLocation>{ value: val, name: name };
        }

        return null;
    }

    // @ts-ignore
    getVertexAttrib(index: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getVertexAttribOffset(index: number, pname: number): number {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    hint(target: number, mode: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isBuffer(buffer: WebGLBuffer): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isContextLost(): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isEnabled(cap: number): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isFramebuffer(framebuffer: WebGLFramebuffer): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isProgram(program: WebGLProgram): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isRenderbuffer(renderbuffer: WebGLRenderbuffer): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isShader(shader: WebGLShader): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    isTexture(texture: WebGLTexture): boolean {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    lineWidth(width: number): void {
        throw new Error('Method not implemented.');
    }

    linkProgram(program: WebGLProgram): void {
        _gl.linkProgram(program ? (<any>program).value : 0);
    }

    // @ts-ignore
    pixelStorei(pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    polygonOffset(factor: number, units: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, pixels: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    renderbufferStorage(target: number, internalformat: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    sampleCoverage(value: number, invert: boolean): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    scissor(x: number, y: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    shaderSource(shader: WebGLShader, source: string): void {
        const newSource = source.replace('#version 300 es', '#version 440');
        _gl.shaderSource(shader ? (<any>shader).value : 0, newSource);
    }

    // @ts-ignore
    stencilFunc(func: number, ref: number, mask: number): void {
        _gl.stencilFunc(func, ref, mask);
    }

    // @ts-ignore
    stencilFuncSeparate(face: number, func: number, ref: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    stencilMask(mask: number): void {
        _gl.stencilMask(mask);
    }

    // @ts-ignore
    stencilMaskSeparate(face: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    stencilOp(fail: number, zfail: number, zpass: number): void {
        _gl.stencilOp(fail, zfail, zpass);
    }

    // @ts-ignore
    stencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    texImage2D(target: number, level: number, internalformat: number, width: number, height: number,
        border: number, format: number, type: number, pixels: ArrayBufferView): void;
    // @ts-ignore
    texImage2D(target: number, level: number, internalformat: number, format: number, type: number,
        source: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    // @ts-ignore
    texImage2D(target: any, level: any, internalformat: any, width: any, height: any, border: any, format?: any, type?: any, pixels?: any) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    texParameterf(target: number, pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    texParameteri(target: number, pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number,
        height: number, format: number, type: number, pixels: ArrayBufferView): void;
    // @ts-ignore
    texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, format: number,
        type: number, source: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    // @ts-ignore
    texSubImage2D(target: any, level: any, xoffset: any, yoffset: any, width: any, height: any, format: any, type?: any, pixels?: any) {
        throw new Error('Method not implemented.');
    }

    uniform1f(location: WebGLUniformLocation, x: number): void {
        _gl.uniform1f(location ? (<any>location).value : 0, x);
    }

    uniform1fv(location: WebGLUniformLocation, v: Float32List): void {
        _gl.uniform1fv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform1i(location: WebGLUniformLocation, x: number): void {
        _gl.uniform1i(location ? (<any>location).value : 0, x);
    }

    uniform1iv(location: WebGLUniformLocation, v: Int32List): void {
        _gl.uniform1iv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform2f(location: WebGLUniformLocation, x: number, y: number): void {
        _gl.uniform2f(location ? (<any>location).value : 0, x, y);
    }

    uniform2fv(location: WebGLUniformLocation, v: Float32List): void {
        _gl.uniform2fv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform2i(location: WebGLUniformLocation, x: number, y: number): void {
        _gl.uniform2i(location ? (<any>location).value : 0, x, y);
    }

    uniform2iv(location: WebGLUniformLocation, v: Int32List): void {
        _gl.uniform2iv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform3f(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        _gl.uniform3f(location ? (<any>location).value : 0, x, y, z);
    }

    uniform3fv(location: WebGLUniformLocation, v: Float32List): void {
        _gl.uniform3fv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform3i(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        _gl.uniform3i(location ? (<any>location).value : 0, x, y, z);
    }

    uniform3iv(location: WebGLUniformLocation, v: Int32List): void {
        _gl.uniform3iv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform4f(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        _gl.uniform4f(location ? (<any>location).value : 0, x, y, z, w);
    }

    uniform4fv(location: WebGLUniformLocation, v: Float32List): void {
        _gl.uniform4fv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniform4i(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        _gl.uniform4i(location ? (<any>location).value : 0, x, y, z, w);
    }

    uniform4iv(location: WebGLUniformLocation, v: Int32List): void {
        _gl.uniform4iv(location ? (<any>location).value : 0, (<any>v).buffer.bufferNativeInstance);
    }

    uniformMatrix2fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        _gl.uniformMatrix2fv(location ? (<any>location).value : 0, transpose, (<any>value).buffer.bufferNativeInstance);
    }

    uniformMatrix3fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        _gl.uniformMatrix3fv(location ? (<any>location).value : 0, transpose, (<any>value).buffer.bufferNativeInstance);
    }

    uniformMatrix4fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        _gl.uniformMatrix4fv(location ? (<any>location).value : 0, transpose, (<any>value).buffer.bufferNativeInstance);
    }

    useProgram(program: WebGLProgram): void {
        _gl.useProgram(program ? (<any>program).value : 0);
    }

    // @ts-ignore
    validateProgram(program: WebGLProgram): void {
        _gl.validateProgram(program ? (<any>program).value : 0);
    }

    // @ts-ignore
    vertexAttrib1f(index: number, x: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib1fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib2f(index: number, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib2fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib3f(index: number, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib3fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib4f(index: number, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    vertexAttrib4fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    vertexAttribPointer(index: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void {
        _gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }

    // @ts-ignore
    viewport(x: number, y: number, width: number, height: number): void {
        _gl.viewport(x, y, width, height);
    }
}
