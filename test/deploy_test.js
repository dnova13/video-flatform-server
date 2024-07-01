const assert = require('assert');
const request = require('supertest');

const main = require('../server/app.js');

const SEC = 1000;

// 실패시 1로 반환, 성공시 0
describe('code test', function () {
    let server;
    let dbPool;

    before((done) => {
        const _express = main();

        server = _express.server;
        dbPool = _express.dbPool;

        done();
    });

    after(() => {
        if (server) {
            // console.log(server);
            server.close();
        }

        if (dbPool) {
            dbPool.end();
        }

        console.info('서버가 종료되었습니다.');
    });

    it('server 실행 테스트', (done) => {
        this.timeout(15 * SEC);

        if (!server) {
            done(new Error('not server'));
        }

        request(server) // 반환된 서버 인스턴스를 사용하여 테스트
            .get('/api/v1/test/sample')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(new Error(err));
                }

                if (res.body && res.body.success === false) {
                    return done(new Error(res.text));
                }

                console.info('### API result:', res.text);
                done();
            });
    });
});
