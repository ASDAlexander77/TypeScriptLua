// @ts-ignore
import gl from 'webgl';

// @ts-ignore
export default class Canvas extends gl implements WebGLRenderingContext {

    canvas: HTMLCanvasElement;
    drawingBufferHeight: number;
    drawingBufferWidth: number;

    // @ts-ignore
    constructor() {
        /* init GL */
        gl.init();
    }

    // @ts-ignore
    addEventListener(eventName: string, cb: any, flag: boolean): void {
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

    // @ts-ignore
    createVertexArray() {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindVertexArray(vao?: WebGLVertexArrayObject): void {
        throw new Error('Method not implemented.');
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
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBinding: number): void {
        throw new Error('Method not implemented.');
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
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    bindAttribLocation(program: WebGLProgram, index: number, name: string): void {
        throw new Error('Method not implemented.');
    }

    bindBuffer(target: number, buffer: WebGLBuffer): void {
        gl.bindBuffer(target, buffer ? buffer.references : 0);
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
        gl.bufferData(target, data.buffer.bufferNativeInstance, usage);
    }

    bufferSubData(target: number, offset: number, data: BufferSource): void {
        gl.bufferSubData(target, offset, (<any>data).buffer.bufferNativeInstance);
    }

    // @ts-ignore
    checkFramebufferStatus(target: number): number {
        throw new Error('Method not implemented.');
    }

    clear(mask: number): void {
        gl.clear(mask);
    }

    clearColor(red: number, green: number, blue: number, alpha: number): void {
        gl.clearColor(red, green, blue, alpha);
    }

    clearDepth(depth: number): void {
        gl.clearDepth(depth);
    }

    clearStencil(s: number): void {
        gl.clearStencil(s);
    }

    // @ts-ignore
    colorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    compileShader(shader: WebGLShader): void {
        throw new Error('Method not implemented.');
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
        const val = gl.createBuffer();
        return <WebGLBuffer>{ references: val };
    }

    // @ts-ignore
    createFramebuffer(): WebGLFramebuffer {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    createProgram(): WebGLProgram {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    createRenderbuffer(): WebGLRenderbuffer {
        throw new Error('Method not implemented.');
    }

    createShader(type: number): WebGLShader {
        const val = gl.createShader(type);
        return <WebGLShader>{ references: val };
    }

    // @ts-ignore
    createTexture(): WebGLTexture {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    cullFace(mode: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteBuffer(buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteFramebuffer(framebuffer: WebGLFramebuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteRenderbuffer(renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteShader(shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    deleteTexture(texture: WebGLTexture): void {
        throw new Error('Method not implemented.');
    }

    depthFunc(func: number): void {
        gl.depthFunc(func);
    }

    depthMask(flag: boolean): void {
        gl.depthMask(flag);
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
        gl.disable(cap);
    }

    // @ts-ignore
    disableVertexAttribArray(index: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    drawArrays(mode: number, first: number, count: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    drawElements(mode: number, count: number, type: number, offset: number): void {
        throw new Error('Method not implemented.');
    }

    enable(cap: number): void {
        gl.enable(cap);
    }

    // @ts-ignore
    enableVertexAttribArray(index: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    finish(): void {
        throw new Error('Method not implemented.');
    }

    flush(): void {
        gl.flush();
    }

    // @ts-ignore
    framebufferRenderbuffer(target: number, attachment: number, renderbuffertarget: number, renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    framebufferTexture2D(target: number, attachment: number, textarget: number, texture: WebGLTexture, level: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    frontFace(mode: number): void {
        throw new Error('Method not implemented.');
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

    // @ts-ignore
    getAttribLocation(program: WebGLProgram, name: string): number {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getBufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getContextAttributes(): WebGLContextAttributes {
        return undefined;
    }

    // @ts-ignore
    getError(): number {
        throw new Error('Method not implemented.');
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
        return undefined;
    }

    // @ts-ignore
    getFramebufferAttachmentParameter(target: number, attachment: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getParameter(pname: number) {
        return 0;
    }

    // @ts-ignore
    getProgramInfoLog(program: WebGLProgram): string {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getProgramParameter(program: WebGLProgram, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getRenderbufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getShaderInfoLog(shader: WebGLShader): string {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getShaderParameter(shader: WebGLShader, pname: number) {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    getShaderPrecisionFormat(shadertype: number, precisiontype: number): WebGLShaderPrecisionFormat {
        return undefined;
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

    // @ts-ignore
    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation {
        throw new Error('Method not implemented.');
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

    // @ts-ignore
    linkProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
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

    // @ts-ignore
    shaderSource(shader: WebGLShader, source: string): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    stencilFunc(func: number, ref: number, mask: number): void {
        gl.stencilFunc(func, ref, mask);
    }

    // @ts-ignore
    stencilFuncSeparate(face: number, func: number, ref: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    stencilMask(mask: number): void {
        gl.stencilMask(mask);
    }

    // @ts-ignore
    stencilMaskSeparate(face: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    stencilOp(fail: number, zfail: number, zpass: number): void {
        gl.stencilOp(fail, zfail, zpass);
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

    // @ts-ignore
    uniform1f(location: WebGLUniformLocation, x: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform1fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform1i(location: WebGLUniformLocation, x: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform1iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform2f(location: WebGLUniformLocation, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform2fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform2i(location: WebGLUniformLocation, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform2iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform3f(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform3fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform3i(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform3iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform4f(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform4fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform4i(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniform4iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniformMatrix2fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniformMatrix3fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    uniformMatrix4fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    useProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    validateProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
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

    // @ts-ignore
    vertexAttribPointer(index: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void {
        throw new Error('Method not implemented.');
    }

    // @ts-ignore
    viewport(x: number, y: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }
}
