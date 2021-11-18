const express = require('express')
const router = express.Router()
const util = require('util')
const creatorSv = require("../../services/creatorService");


router.post("", async (req, res) => {

    let body = req.body;
    let result;

    body.user_id = req.uinfo["u"];
    let keys = ["name","intro", "sns", "piece", "activity_region", "fids"]

    if (!_util.hasKeysArray(body, keys)) {

        // console.log("key err");
        return res.json(jresp.invalidData());
    }

    if (_util.isObjectBlankArray(body, keys, keys.length - 1)) {
        console.log("blank err");
        return res.json(jresp.invalidData());
    }

    if (!_util.areBeyondZeroArr(body.fids)) {

        console.log("under zero");
        return res.json(jresp.invalidData());
    }

    if (body.fids.length < 1) {
        console.log("empty");
        return res.json(jresp.invalidData());
    }

    result = await creatorSv.applyCreator(body);

    return res.json(result);

});

router.post("/chk/duplicate", async (req, res) => {

    let uid = req.uinfo["u"]
    let result = await creatorSv.chkDuplicateApply(uid);

    return res.json(result);
});


router.post("/upload/videos", async (req, res) => {

    let body = req.body
    let result;

    console.log(body);

    if (!_util.isBeyondZero(body.id)) {
        console.log("invalid num");
        return res.json(jresp.invalidData());
    }

    if (!(Array.isArray(body.videos) && body.videos.length === 3)) {
        console.log("invalid arr");
        return res.json(jresp.invalidData());
    }

    result = await creatorSv.uploadVideos(body);

    return res.json(result);
});


router.get("/read", async (req, res) => {

    let uid = req.uinfo["u"]
    let result = await creatorSv.getAppliedInfoByUserId(uid);

    return res.json(result);

});


// TODO : 추후 예정?
router.get("/modify", async (req, res) => {

    console.log("modify");

    let result = "";

    return res.json(result);
});


module.exports = router;