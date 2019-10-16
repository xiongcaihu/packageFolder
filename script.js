var fs = require("fs-extra");
var path = require("path");

var entryPath = path.join(__dirname, "entry/packageEntry"); // 输入的路径入口
var tempFile = path.join(__dirname, "entry/tempFile.json"); // 输出的内容文件
var convertPath = path.join(__dirname, "entry/convertEntry"); // 转化后输出的文件夹

function walkFiles(tPath) {
    var obj = [];
    var rels = fs.readdirSync(tPath, {
        withFileTypes: true
    });

    rels.forEach(item => {
        var filePath = path.join(tPath, item.name);
        if (!item.isDirectory()) {
            var content = fs.readFileSync(filePath);
            content = Array.from(content);
            obj.push({
                isFile: true,
                name: item.name,
                content
            });
        } else {
            obj.push({
                name: item.name,
                isFile: false,
                childs: walkFiles(filePath)
            });
        }
    });
    return obj;
}

function convertTempFile(tPath, obj) {
    obj.forEach(item => {
        var nowPath = path.join(tPath, item.name);
        if (item.isFile) {
            fs.ensureFileSync(nowPath);
            fs.writeFileSync(nowPath, Buffer.from(item.content));
        } else {
            convertTempFile(nowPath, item.childs);
        }
    });
}

function test() {
    // 将指定文件夹里的所有内容转换成一个二进制文件
    var rels = walkFiles(entryPath);
    fs.outputJsonSync(tempFile, rels);
    // 将生成的中间文件再转成和原来结构一样的文件夹
    fs.ensureDirSync(convertPath);
    convertTempFile(convertPath, fs.readJsonSync(tempFile));
}

test();
