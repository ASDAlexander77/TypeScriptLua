import gl from 'webgl';

export default class Canvas implements WebGLRenderingContext {

    canvas: HTMLCanvasElement;
    drawingBufferHeight: number;
    drawingBufferWidth: number;

    constructor() {
        /* init GL */
        gl.init();
    }

    addEventListener(eventName: string, cb: any, flag: boolean): void {
    }

    drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttribDivisor(index: number, divisor: number): void {
        throw new Error('Method not implemented.');
    }

    createVertexArray() {
        throw new Error('Method not implemented.');
    }

    bindVertexArray(vao?: WebGLVertexArrayObject): void {
        throw new Error('Method not implemented.');
    }

    deleteVertexArray(vao: WebGLVertexArrayObject): void {
        throw new Error('Method not implemented.');
    }

    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number,
        dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void {
        throw new Error('Method not implemented.');
    }

    renderbufferStorageMultisample(target: number, samples: number, internalformat: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    bindBufferBase(target: number, index: number, buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number {
        throw new Error('Method not implemented.');
    }

    uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBinding: number): void {
        throw new Error('Method not implemented.');
    }

    createQuery(): WebGLQuery {
        throw new Error('Method not implemented.');
    }

    deleteQuery(query: WebGLQuery): void {
        throw new Error('Method not implemented.');
    }

    beginQuery(target: number, query: WebGLQuery): void {
        throw new Error('Method not implemented.');
    }

    endQuery(target: number): void {
        throw new Error('Method not implemented.');
    }

    getQueryParameter(query: WebGLQuery, pname: number) {
        throw new Error('Method not implemented.');
    }

    getQuery(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    drawBuffers(buffers: number[]): void {
        throw new Error('Method not implemented.');
    }

    readBuffer(src: number): void {
        throw new Error('Method not implemented.');
    }

    texImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        depth: number, border: number, format: number, type: number, pixels: ArrayBufferView, offset?: number): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        depth: number, border: number, format: number, type: number,
        pixels: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    texImage3D(target: any, level: any, internalformat: any, width: any, height: any, depth: any, border: any,
        format: any, type: any, pixels: any, offset?: any) {
        throw new Error('Method not implemented.');
    }

    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number,
        depth: number, border: number, data: ArrayBufferView, offset?: number, length?: number): void {
        throw new Error('Method not implemented.');
    }

    createTransformFeedback(): WebGLTransformFeedback {
        throw new Error('Method not implemented.');
    }

    deleteTransformFeedback(transformFeedbac: WebGLTransformFeedback): void {
        throw new Error('Method not implemented.');
    }

    bindTransformFeedback(target: number, transformFeedback: WebGLTransformFeedback): void {
        throw new Error('Method not implemented.');
    }

    beginTransformFeedback(primitiveMode: number): void {
        throw new Error('Method not implemented.');
    }

    endTransformFeedback(): void {
        throw new Error('Method not implemented.');
    }

    transformFeedbackVaryings(program: WebGLProgram, varyings: string[], bufferMode: number): void {
        throw new Error('Method not implemented.');
    }

    clearBufferfv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    clearBufferiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    clearBufferuiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number): void {
        throw new Error('Method not implemented.');
    }

    clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void {
        throw new Error('Method not implemented.');
    }

    activeTexture(texture: number): void {
        throw new Error('Method not implemented.');
    }

    attachShader(program: WebGLProgram, shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    bindAttribLocation(program: WebGLProgram, index: number, name: string): void {
        throw new Error('Method not implemented.');
    }

    bindBuffer(target: number, buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    bindFramebuffer(target: number, framebuffer: WebGLFramebuffer): void {
        throw new Error('Method not implemented.');
    }

    bindRenderbuffer(target: number, renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    bindTexture(target: number, texture: WebGLTexture): void {
        throw new Error('Method not implemented.');
    }

    blendColor(red: number, green: number, blue: number, alpha: number): void {
        throw new Error('Method not implemented.');
    }

    blendEquation(mode: number): void {
        throw new Error('Method not implemented.');
    }

    blendEquationSeparate(modeRGB: number, modeAlpha: number): void {
        throw new Error('Method not implemented.');
    }

    blendFunc(sfactor: number, dfactor: number): void {
        throw new Error('Method not implemented.');
    }

    blendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void {
        throw new Error('Method not implemented.');
    }

    bufferData(target: number, sizeOrData: number | BufferSource, usage: number): void;
    bufferData(target: any, data: any, usage: any) {
        throw new Error('Method not implemented.');
    }

    bufferSubData(target: number, offset: number, data: BufferSource): void {
        throw new Error('Method not implemented.');
    }

    checkFramebufferStatus(target: number): number {
        throw new Error('Method not implemented.');
    }

    clear(mask: number): void {
        throw new Error('Method not implemented.');
    }

    clearColor(red: number, green: number, blue: number, alpha: number): void {
        throw new Error('Method not implemented.');
    }

    clearDepth(depth: number): void {
        throw new Error('Method not implemented.');
    }

    clearStencil(s: number): void {
        throw new Error('Method not implemented.');
    }

    colorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {
        throw new Error('Method not implemented.');
    }

    compileShader(shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number,
        border: number, data: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number,
        height: number, format: number, data: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    copyTexImage2D(target: number, level: number, internalformat: number, x: number, y: number, width: number,
        height: number, border: number): void {
        throw new Error('Method not implemented.');
    }

    copyTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, x: number, y: number,
        width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    createBuffer(): WebGLBuffer {
        const val = gl.createBuffer();
        return <WebGLBuffer>{ references: val };
    }

    createFramebuffer(): WebGLFramebuffer {
        throw new Error('Method not implemented.');
    }

    createProgram(): WebGLProgram {
        throw new Error('Method not implemented.');
    }

    createRenderbuffer(): WebGLRenderbuffer {
        throw new Error('Method not implemented.');
    }

    createShader(type: number): WebGLShader {
        throw new Error('Method not implemented.');
    }

    createTexture(): WebGLTexture {
        throw new Error('Method not implemented.');
    }

    cullFace(mode: number): void {
        throw new Error('Method not implemented.');
    }

    deleteBuffer(buffer: WebGLBuffer): void {
        throw new Error('Method not implemented.');
    }

    deleteFramebuffer(framebuffer: WebGLFramebuffer): void {
        throw new Error('Method not implemented.');
    }

    deleteProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    deleteRenderbuffer(renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    deleteShader(shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    deleteTexture(texture: WebGLTexture): void {
        throw new Error('Method not implemented.');
    }

    depthFunc(func: number): void {
        throw new Error('Method not implemented.');
    }

    depthMask(flag: boolean): void {
        throw new Error('Method not implemented.');
    }

    depthRange(zNear: number, zFar: number): void {
        throw new Error('Method not implemented.');
    }

    detachShader(program: WebGLProgram, shader: WebGLShader): void {
        throw new Error('Method not implemented.');
    }

    disable(cap: number): void {
        throw new Error('Method not implemented.');
    }

    disableVertexAttribArray(index: number): void {
        throw new Error('Method not implemented.');
    }

    drawArrays(mode: number, first: number, count: number): void {
        throw new Error('Method not implemented.');
    }

    drawElements(mode: number, count: number, type: number, offset: number): void {
        throw new Error('Method not implemented.');
    }

    enable(cap: number): void {
        throw new Error('Method not implemented.');
    }

    enableVertexAttribArray(index: number): void {
        throw new Error('Method not implemented.');
    }

    finish(): void {
        throw new Error('Method not implemented.');
    }

    flush(): void {
        throw new Error('Method not implemented.');
    }

    framebufferRenderbuffer(target: number, attachment: number, renderbuffertarget: number, renderbuffer: WebGLRenderbuffer): void {
        throw new Error('Method not implemented.');
    }

    framebufferTexture2D(target: number, attachment: number, textarget: number, texture: WebGLTexture, level: number): void {
        throw new Error('Method not implemented.');
    }

    frontFace(mode: number): void {
        throw new Error('Method not implemented.');
    }

    generateMipmap(target: number): void {
        throw new Error('Method not implemented.');
    }

    getActiveAttrib(program: WebGLProgram, index: number): WebGLActiveInfo {
        throw new Error('Method not implemented.');
    }

    getActiveUniform(program: WebGLProgram, index: number): WebGLActiveInfo {
        throw new Error('Method not implemented.');
    }

    getAttachedShaders(program: WebGLProgram): WebGLShader[] {
        throw new Error('Method not implemented.');
    }

    getAttribLocation(program: WebGLProgram, name: string): number {
        throw new Error('Method not implemented.');
    }

    getBufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getContextAttributes(): WebGLContextAttributes {
        return undefined;
    }

    getError(): number {
        throw new Error('Method not implemented.');
    }

    getExtension(extensionName: 'EXT_blend_minmax'): EXT_blend_minmax;
    getExtension(extensionName: 'EXT_texture_filter_anisotropic'): EXT_texture_filter_anisotropic;
    getExtension(extensionName: 'EXT_frag_depth'): EXT_frag_depth;
    getExtension(extensionName: 'EXT_shader_texture_lod'): EXT_shader_texture_lod;
    getExtension(extensionName: 'EXT_sRGB'): EXT_sRGB;
    getExtension(extensionName: 'OES_vertex_array_object'): OES_vertex_array_object;
    getExtension(extensionName: 'WEBGL_color_buffer_float'): WEBGL_color_buffer_float;
    getExtension(extensionName: 'WEBGL_compressed_texture_astc'): WEBGL_compressed_texture_astc;
    getExtension(extensionName: 'WEBGL_compressed_texture_s3tc_srgb'): WEBGL_compressed_texture_s3tc_srgb;
    getExtension(extensionName: 'WEBGL_debug_shaders'): WEBGL_debug_shaders;
    getExtension(extensionName: 'WEBGL_draw_buffers'): WEBGL_draw_buffers;
    getExtension(extensionName: 'WEBGL_lose_context'): WEBGL_lose_context;
    getExtension(extensionName: 'WEBGL_depth_texture'): WEBGL_depth_texture;
    getExtension(extensionName: 'WEBGL_debug_renderer_info'): WEBGL_debug_renderer_info;
    getExtension(extensionName: 'WEBGL_compressed_texture_s3tc'): WEBGL_compressed_texture_s3tc;
    getExtension(extensionName: 'OES_texture_half_float_linear'): OES_texture_half_float_linear;
    getExtension(extensionName: 'OES_texture_half_float'): OES_texture_half_float;
    getExtension(extensionName: 'OES_texture_float_linear'): OES_texture_float_linear;
    getExtension(extensionName: 'OES_texture_float'): OES_texture_float;
    getExtension(extensionName: 'OES_standard_derivatives'): OES_standard_derivatives;
    getExtension(extensionName: 'OES_element_index_uint'): OES_element_index_uint;
    getExtension(extensionName: 'ANGLE_instanced_arrays'): ANGLE_instanced_arrays;
    getExtension(extensionName: string | any): any {
        return undefined;
    }

    getFramebufferAttachmentParameter(target: number, attachment: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getParameter(pname: number) {
        return 0;
    }

    getProgramInfoLog(program: WebGLProgram): string {
        throw new Error('Method not implemented.');
    }

    getProgramParameter(program: WebGLProgram, pname: number) {
        throw new Error('Method not implemented.');
    }

    getRenderbufferParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getShaderInfoLog(shader: WebGLShader): string {
        throw new Error('Method not implemented.');
    }

    getShaderParameter(shader: WebGLShader, pname: number) {
        throw new Error('Method not implemented.');
    }

    getShaderPrecisionFormat(shadertype: number, precisiontype: number): WebGLShaderPrecisionFormat {
        return undefined;
    }

    getShaderSource(shader: WebGLShader): string {
        throw new Error('Method not implemented.');
    }

    getSupportedExtensions(): string[] {
        throw new Error('Method not implemented.');
    }

    getTexParameter(target: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getUniform(program: WebGLProgram, location: WebGLUniformLocation) {
        throw new Error('Method not implemented.');
    }

    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation {
        throw new Error('Method not implemented.');
    }

    getVertexAttrib(index: number, pname: number) {
        throw new Error('Method not implemented.');
    }

    getVertexAttribOffset(index: number, pname: number): number {
        throw new Error('Method not implemented.');
    }

    hint(target: number, mode: number): void {
        throw new Error('Method not implemented.');
    }

    isBuffer(buffer: WebGLBuffer): boolean {
        throw new Error('Method not implemented.');
    }

    isContextLost(): boolean {
        throw new Error('Method not implemented.');
    }

    isEnabled(cap: number): boolean {
        throw new Error('Method not implemented.');
    }

    isFramebuffer(framebuffer: WebGLFramebuffer): boolean {
        throw new Error('Method not implemented.');
    }

    isProgram(program: WebGLProgram): boolean {
        throw new Error('Method not implemented.');
    }

    isRenderbuffer(renderbuffer: WebGLRenderbuffer): boolean {
        throw new Error('Method not implemented.');
    }

    isShader(shader: WebGLShader): boolean {
        throw new Error('Method not implemented.');
    }

    isTexture(texture: WebGLTexture): boolean {
        throw new Error('Method not implemented.');
    }

    lineWidth(width: number): void {
        throw new Error('Method not implemented.');
    }

    linkProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    pixelStorei(pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    polygonOffset(factor: number, units: number): void {
        throw new Error('Method not implemented.');
    }

    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, pixels: ArrayBufferView): void {
        throw new Error('Method not implemented.');
    }

    renderbufferStorage(target: number, internalformat: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    sampleCoverage(value: number, invert: boolean): void {
        throw new Error('Method not implemented.');
    }

    scissor(x: number, y: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }

    shaderSource(shader: WebGLShader, source: string): void {
        throw new Error('Method not implemented.');
    }

    stencilFunc(func: number, ref: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    stencilFuncSeparate(face: number, func: number, ref: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    stencilMask(mask: number): void {
        throw new Error('Method not implemented.');
    }

    stencilMaskSeparate(face: number, mask: number): void {
        throw new Error('Method not implemented.');
    }

    stencilOp(fail: number, zfail: number, zpass: number): void {
        throw new Error('Method not implemented.');
    }

    stencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void {
        throw new Error('Method not implemented.');
    }

    texImage2D(target: number, level: number, internalformat: number, width: number, height: number,
        border: number, format: number, type: number, pixels: ArrayBufferView): void;
    texImage2D(target: number, level: number, internalformat: number, format: number, type: number,
        source: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    texImage2D(target: any, level: any, internalformat: any, width: any, height: any, border: any, format?: any, type?: any, pixels?: any) {
        throw new Error('Method not implemented.');
    }

    texParameterf(target: number, pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    texParameteri(target: number, pname: number, param: number): void {
        throw new Error('Method not implemented.');
    }

    texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number,
        height: number, format: number, type: number, pixels: ArrayBufferView): void;
    texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, format: number,
        type: number, source: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): void;
    texSubImage2D(target: any, level: any, xoffset: any, yoffset: any, width: any, height: any, format: any, type?: any, pixels?: any) {
        throw new Error('Method not implemented.');
    }

    uniform1f(location: WebGLUniformLocation, x: number): void {
        throw new Error('Method not implemented.');
    }

    uniform1fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniform1i(location: WebGLUniformLocation, x: number): void {
        throw new Error('Method not implemented.');
    }

    uniform1iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    uniform2f(location: WebGLUniformLocation, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    uniform2fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniform2i(location: WebGLUniformLocation, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    uniform2iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    uniform3f(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    uniform3fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniform3i(location: WebGLUniformLocation, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    uniform3iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    uniform4f(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    uniform4fv(location: WebGLUniformLocation, v: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniform4i(location: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    uniform4iv(location: WebGLUniformLocation, v: Int32List): void {
        throw new Error('Method not implemented.');
    }

    uniformMatrix2fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniformMatrix3fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    uniformMatrix4fv(location: WebGLUniformLocation, transpose: boolean, value: Float32List): void {
        throw new Error('Method not implemented.');
    }

    useProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    validateProgram(program: WebGLProgram): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib1f(index: number, x: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib1fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib2f(index: number, x: number, y: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib2fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib3f(index: number, x: number, y: number, z: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib3fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib4f(index: number, x: number, y: number, z: number, w: number): void {
        throw new Error('Method not implemented.');
    }

    vertexAttrib4fv(index: number, values: Float32List): void {
        throw new Error('Method not implemented.');
    }

    vertexAttribPointer(index: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void {
        throw new Error('Method not implemented.');
    }

    viewport(x: number, y: number, width: number, height: number): void {
        throw new Error('Method not implemented.');
    }
}
