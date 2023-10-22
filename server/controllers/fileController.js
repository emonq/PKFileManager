const { FILE_STORAGE_DIR } = process.env;

const { User } = require("../models/user");
const { File } = require("../models/file");
const fs = require("fs");

const generateFileList = (user) => {
    return user.files.map(file => {
        return {
            id: file._id,
            name: file.name,
            md5: file.md5,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        }
    });
}

exports.upload = async (req, res) => {
    const user = await User.findOne({ id: req.session.user.id });
    if (!user) {
        res.status(401).end();
        req.session.destroy();
        return;
    }
    let fileInfos = {};

    for (let name in req.files) {
        const file = req.files[name];

        if (user.files.find(f => f.name === file.name)) {
            fileInfos[name] = {
                status: 'error',
                name: file.name,
                error: 'File already exists',
            }
            continue;
        }

        const fileData = new File({
            name: file.name,
            mimetype: file.mimetype,
            size: file.size,
            md5: file.md5,
        });
        try {
            await file.mv(`${FILE_STORAGE_DIR}/${req.session.user.id}/${file.md5}`);
            user.files.push(fileData);
            await user.save();
            fileInfos[name] = {
                id: fileData._id,
                name: fileData.name,
                md5: fileData.md5,
                createdAt: fileData.createdAt,
                updatedAt: fileData.updatedAt,
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal server error");
        }
    }
    res.json(fileInfos);
}

exports.list = async (req, res) => {
    const user = await User.findOne({ id: req.session.user.id });
    if (!user) {
        res.status(400).end();
        req.session.destroy();
        return;
    }
    const fileList = generateFileList(user);
    res.json(fileList);
}

exports.download = async (req, res) => {
    const user = await User.findOne({ id: req.session.user.id });
    const file = user.files.id(req.params.id);
    if (!file) {
        res.status(404).end();
        return;
    }
    res.download(`${FILE_STORAGE_DIR}/${user.id}/${file.md5}`, file.name);
}

exports.delete = async (req, res) => {
    const user = await User.findOne({ id: req.session.user.id });
    const file = user.files.id(req.params.id);
    if (!file) {
        res.status(404).end();
        return;
    }
    file.deleteOne();
    await user.save();
    if (!user.files.find(f => f.md5 === file.md5)) {
        fs.unlinkSync(`${FILE_STORAGE_DIR}/${user.id}/${file.md5}`)
    }
    res.json(generateFileList(user));
}