import express from "express"
import dailyStSv from "../../services/dailyStatisticsService"
const userMngSv = require("../../services/userManageService")

const router = express.Router();

router.post("/signin", async (req, res) => {

    let body = req.body
    let sql
    let sqlP
    let result
    let out = {}
    let oauthType = ["normal", "kakao", "naver", "google", "facebook"];

    if (!oauthType.includes(body["type"])) {
        return res.json(jresp.invalidData());
    }

    console.log(body.id, body.type);

    if (body['type'] === 'normal') {

        if (_util.isBlanks(body['id'], body["password"])) {
            return res.json(jresp.invalidAccount());
        }

        sql = 'select a.user_id, b.retire_chk, b.suspend_chk, b.lv ' +
                'from oauth a ' +
                'inner join `user` b ' +
                'on a.user_id  = b.id ' +
                'where a.app_id = :id ' +
                'and a.oauth_type = :type ' +
                'and a.password = password(:pw) ';
        sqlP = {id: body['id'], pw: body["password"], type: body['type']}

        result = await db.qry(sql, sqlP)

        // sql err
        if (!result['success']) {
            console.error(result)
            return res.json(jresp.sqlError());
        }

        if (result['rows'].length < 1) {
            return res.json(jresp.invalidAccount());
        }

    } else {

        if (_util.isBlanks(body['type'], body['id'])) {
            return res.json(jresp.invalidAccount());
        }

        sql = 'select a.user_id, b.retire_chk, b.suspend_chk, b.lv ' +
            'from oauth a ' +
            'inner join `user` b ' +
            'on a.user_id  = b.id ' +
            'where a.app_id = :id ' +
            'and a.oauth_type = :type '
        sqlP = {id: body['id'], type: body['type']}

        result = await db.qry(sql, sqlP)

        console.log(result);

        // sql err
        if (!result['success']) {
            console.error(result)
            return res.json(jresp.sqlError());
        }

        if (result['rows'].length < 1) {
            return res.json(jresp.emptyData());
        }
    }

    let retireChk = result['rows'][0]["retire_chk"];
    let suspendChk = result['rows'][0]["suspend_chk"];

    if (suspendChk > 0) {
        return res.json(jresp.suspendedUser());
    }

    if (retireChk > 0) {
        return res.json(jresp.retiredUser());
    }

    let jwtObj = {
        u: result['rows'][0]['user_id']
        ,l: result['rows'][0]['lv']
    }

    let token = await jwt.register(jwtObj)

    // 쿠키 셋팅
    res.cookie('token', token)

    let _data = {
        token: token
    }

    dailyStSv.dailyChkStatistics("access");

    return res.json(jresp.successData(_data, result['rows'].length, result['rows'].length));
});

router.post("/signup", async (req, res) => {

    let body = req.body
    let out;

    out = await signup(body);

    await dailyStSv.dailyChkStatistics("join");
    return res.json(out);
});

router.post("/duplicateNickname", async (req, res) => {

    let body = req.body;
    let result;

    if (!_util.hasKey(body, 'nickname') || _util.isBlank(body['nickname'])) {
        return res.json(jresp.invalidData())
    }

    result = await checkDuplicateNickname(body['nickname'])
    res.send(result)
});

router.post("/duplicatePhone", async (req, res) => {

    let body = req.body;
    let result;

    if (!_util.hasKey(body, 'phone') || _util.isBlank(body['phone'])) {
        return res.json(jresp.invalidData())
    }

    result = await checkDuplicatePhone(body['phone'])
    res.send(result)
});

router.post("/duplicateEmail", async (req, res) => {

    let body = req.body;
    let result;

    if (!_util.hasKey(body, 'email') || _util.isBlank(body['email'])) {
        return res.json(jresp.invalidData())
    }

    result = await checkDuplicateEmail(body['email'])
    res.send(result)
});

router.post("/update/fcmtoken", async (req, res) => {

    let uid = req.body.user_id;
    let token = req.body.token;

    if (_util.isBlank(token)) {
        return jresp.invalidData();
    }

    let result = await userMngSv.updateFcmToken(uid, token);

    return res.json(result);
});

router.post("/chkSlang", async (req, res) => {

    let body = req.body;

    if (!_util.hasKey(body, 'str') || _util.isBlank(body['str'])) {
        return res.json(jresp.invalidData())
    }

    let str = body['str'].replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]|(?:\s)+|\s{2,}/gi,"");

    console.log(str);

    let result = await chkSlang(str);

    res.send(result)
});


async function chkSlang(str) {

    let sql = `select count(*) as cnt
                from others_meta 
                where \`type\` = 'slang'
                and '${str}' like concat('%', value ,'%')`

    let result = await db.qry(sql);
    let chk = _util.selectChkFromDB(result);

    if (chk < 1) {
        return jresp.sqlError();
    }

    return jresp.successData({is_slang : result["rows"][0]["cnt"] > 0});
}


async function signup(body) {

    let sql;
    let sqlParams;
    let result;
    let keys = ['name', 'nickname', 'birth', 'phone', 'address', 'email', 'type', 'app_id'];

    if (!_util.hasKeysArray(body, keys)) {

        console.log("key err");
        return jresp.invalidData();
    }

    if (_util.isObjectBlankArray(body, keys, keys.length)) {
        console.log("blank err");
        return jresp.invalidData();
    }

    sql = "INSERT INTO `user` (`name`, nickname, birth, phone, address, email, icon, gender)" +
        "VALUES(:name, :nickname, :birth, :phone, :addr, :email, :icon, :gender) "
    sqlParams = {
        name: body['name']
        , nickname: body['nickname']
        , birth: body['birth']
        , phone: body['phone']
        , addr: body['address']
        , email: body['email']
        , icon: body['icon'] ? body['icon'] : 0
        , gender: body['gender'] ? body['gender'] : 1
    }

    result = await db.qry(sql, sqlParams)

    if (!result['success'] || result['rows'].length < 1) {
        console.log(result)
        return jresp.sqlError(result.message);
    }
    console.log("result ", result['rows']);
    const uid = result['rows']['insertId']

    console.log("아이디", uid);

    sql = "INSERT INTO oauth (oauth_type, app_id, `password`, user_id) " +
        "VALUES(:type, :app_id, password(:pw), :uid) ";
    sqlParams = {
        type: body['type']
        , app_id: body['app_id']
        , pw: body['password'] ? body['password'] : null
        , uid: uid
    }

    result = await db.qry(sql, sqlParams)

    if (!result['success'] || result['rows'].length < 1) {

        return jresp.sqlError();
    }

    return jresp.successData();
}

async function checkDuplicateEmail(email) {

    let sql;
    let sqlP;
    let result;

    sql = "select count(*) as cnt " +
            "from `user` " +
            "where email = :email";
    sqlP = {email: email}

    result = await db.qry(sql, sqlP)

    // sql err
    if (!result['success']) {
        console.error(result)
        return jresp.sqlError();
    }

    if (result['rows'].length < 1) {
        return jresp.sqlError();
    }

    if (result["rows"][0]["cnt"] < 1) {
        return jresp.successData();
    }

    return jresp.duplicateData();
}

async function checkDuplicateNickname(nickname) {

    let sql;
    let sqlP;
    let result;

    sql = "select count(*) as cnt " +
        "from `user` " +
        "where nickname = :nickname";
    sqlP = {nickname: nickname};

    result = await db.qry(sql, sqlP)

    // sql err
    if (!result['success']) {
        console.error(result)
        return jresp.sqlError();
    }

    if (result['rows'].length < 1) {
        return jresp.sqlError();
    }

    if (result["rows"][0]["cnt"] < 1) {
        return jresp.successData();
    }

    return jresp.duplicateData();
}

async function checkDuplicatePhone(phone) {

    let sql;
    let sqlP;
    let result;

    sql = "select count(*) as cnt " +
        "from `user` " +
        "where phone = :phone";
    sqlP = {phone: phone};

    result = await db.qry(sql, sqlP)

    // sql err
    if (!result['success']) {
        console.error(result)
        return jresp.sqlError();
    }

    if (result['rows'].length < 1) {
        return jresp.sqlError();
    }

    if (result["rows"][0]["cnt"] < 1) {
        return jresp.successData();
    }

    return jresp.duplicateData();
}


module.exports = router
