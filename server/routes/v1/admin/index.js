const express = require('express')
const router = express.Router()

const statistics = require('./statistics');

const userManage = require('./user_manage');

const postManage = require('./post_manage');
const postComList = require('./post_com');
const tags = require('./tags');

const pointsManage = require('./points_manage');

const report = require('./report');
const serviceMange = require('./service_manage');


router.get('/', (req, res) => {
    res.json({success: true})
})

router.use(async(req, res, next) => {

    if (!_util.hasKey(req, 'uinfo') || !_util.hasKey(req.uinfo, 'l') || req.uinfo['l'] < 255) {
        return res.json(jresp.invalidAccount())
    }

    next();
})

router.get('/valid', (req, res) => {
    res.json({success: true})
});


router.use("/statistics", statistics);
router.use("/user/manage", userManage);
router.use("/report", report);

router.use("/post/manage", postManage);
router.use("/post/com", postComList);

router.use("/tags", tags);

router.use("/points/manage", pointsManage);
router.use("/service", serviceMange);


module.exports = router
