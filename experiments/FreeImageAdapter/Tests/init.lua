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

if dip == nil then
	print ("can't load.")
end

dib32bit = fi.convertTo32Bits(dib)
if dip == nil then
	print ("can't convert.")
end

fi.unload(dib)

width = fi.getWidth(dib32bit)
height = fi.getHeight(dib32bit)

print ("width = " .. width .. ", height = " .. height)

bits = fi.getBits(dib32bit)

if dip == nil then
	print ("can't get bits.")
end

fif.unload(dib32bit)

print ("All done.")
