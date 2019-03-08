fi = require("freeimageadapter")

url = "0.png";

fif = fi.getFileType(url)
print ("FIF: " .. fif)
if fif == -1 then
	fif = fi.getFIFFromFilename(url)
	print ("FIF from filename: " .. fif)
end

if fi.fifSupportsReading(fif) then
	print ("loading file")
	dib = fi.load(fif, url);
else
	print ("file not supported")
end

if dib == nil then
	print ("can't load.")
end

dib32bit = fi.convertTo32Bits(dib)
fi.unload(dib)
if dib32bit == nil then
	print ("can't convert.")
end

width = fi.getWidth(dib32bit)
height = fi.getHeight(dib32bit)

print ("width = " .. width .. ", height = " .. height)

bits = fi.getBits(dib32bit)

if bits == nil then
	print ("can't get bits.")
end

fi.unload(dib32bit)

print ("All done. 1")

mi = fi.loadImage(url);
if mi == nil then
	print ("can't load.")
end

print ("Image data, width = " .. mi.width .. ", height = " .. mi.height)
