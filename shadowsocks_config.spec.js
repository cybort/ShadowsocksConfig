"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shadowsocks_config_1 = require("./shadowsocks_config");
describe('shadowsocks_config', function () {
    describe('Config API', function () {
        it('has expected shape', function () {
            var config = shadowsocks_config_1.makeConfig({
                host: '192.168.100.1',
                port: 8888,
                method: 'chacha20',
                password: 'P@$$W0RD!',
            });
            var host = config.host.data;
            var port = config.port.data;
            var method = config.method.data;
            var password = config.password.data;
            expect(host).toEqual('192.168.100.1');
            expect(port).toEqual(8888);
            expect(method).toEqual('chacha20');
            expect(password).toEqual('P@$$W0RD!');
        });
    });
    describe('field validation', function () {
        it('accepts IPv4 address hosts', function () {
            for (var _i = 0, _a = ['127.0.0.1', '8.8.8.8', '192.168.0.1']; _i < _a.length; _i++) {
                var valid = _a[_i];
                var host = new shadowsocks_config_1.Host(valid);
                expect(host.data).toEqual(valid);
                expect(host.isIPv4).toBeTruthy();
                expect(host.isIPv6).toBeFalsy();
                expect(host.isHostname).toBeFalsy();
            }
        });
        it('accepts IPv6 address hosts', function () {
            for (var _i = 0, _a = ['0:0:0:0:0:0:0:1', '2001:0:ce49:7601:e866:efff:62c3:fffe']; _i < _a.length; _i++) {
                var valid = _a[_i];
                var host = new shadowsocks_config_1.Host(valid);
                expect(host.data).toEqual(valid);
                expect(host.isIPv4).toBeFalsy();
                expect(host.isIPv6).toBeTruthy();
                expect(host.isHostname).toBeFalsy();
            }
        });
        it('accepts valid hostname hosts', function () {
            for (var _i = 0, _a = ['localhost', 'example.com']; _i < _a.length; _i++) {
                var valid = _a[_i];
                var host = new shadowsocks_config_1.Host(valid);
                expect(host.data).toEqual(valid);
                expect(host.isIPv4).toBeFalsy();
                expect(host.isIPv6).toBeFalsy();
                expect(host.isHostname).toBeTruthy();
            }
        });
        it('accepts valid unicode hostnames and converts them to punycode', function () {
            var testCases = [['mañana.com', 'xn--maana-pta.com'], ['☃-⌘.com', 'xn----dqo34k.com']];
            for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
                var _a = testCases_1[_i], input = _a[0], converted = _a[1];
                var host = new shadowsocks_config_1.Host(input);
                expect(host.data).toEqual(converted);
                expect(host.isIPv6).toBeFalsy();
                expect(host.isIPv4).toBeFalsy();
                expect(host.isHostname).toBeTruthy();
            }
        });
        it('rejects invalid host values', function () {
            var _loop_1 = function (invalid) {
                expect(function () { return new shadowsocks_config_1.Host(invalid); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            };
            for (var _i = 0, _a = ['-', '-pwned', ';echo pwned', '.', '....']; _i < _a.length; _i++) {
                var invalid = _a[_i];
                _loop_1(invalid);
            }
        });
        it('throws on empty host', function () {
            expect(function () { return new shadowsocks_config_1.Host(''); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('accepts valid ports', function () {
            expect(new shadowsocks_config_1.Port('8388').data).toEqual(8388);
            expect(new shadowsocks_config_1.Port('443').data).toEqual(443);
            expect(new shadowsocks_config_1.Port(8388).data).toEqual(8388);
            expect(new shadowsocks_config_1.Port(443).data).toEqual(443);
        });
        it('throws on empty port', function () {
            expect(function () { return new shadowsocks_config_1.Port(''); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('throws on invalid port', function () {
            expect(function () { return new shadowsocks_config_1.Port('foo'); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port('-123'); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port('123.4'); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port('123.4'); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port(-123); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port(123.4); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return new shadowsocks_config_1.Port(65536); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('normalizes non-normalized but valid port', function () {
            expect(new shadowsocks_config_1.Port('01234').data).toEqual(1234);
        });
        it('throws on empty method', function () {
            expect(function () { return new shadowsocks_config_1.Method(''); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('throws on invalid method', function () {
            expect(function () { return new shadowsocks_config_1.Method('foo'); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('accepts valid methods', function () {
            for (var _i = 0, _a = [
                'rc4-md5',
                'aes-128-gcm',
                'aes-192-gcm',
                'aes-256-gcm',
                'aes-128-cfb',
                'aes-192-cfb',
                'aes-256-cfb',
                'aes-128-ctr',
                'aes-192-ctr',
                'aes-256-ctr',
                'camellia-128-cfb',
                'camellia-192-cfb',
                'camellia-256-cfb',
                'bf-cfb',
                'chacha20-ietf-poly1305',
                'salsa20',
                'chacha20',
                'chacha20-ietf',
            ]; _i < _a.length; _i++) {
                var method = _a[_i];
                expect(new shadowsocks_config_1.Method(method).data).toEqual(method);
            }
        });
        it('accepts empty password', function () {
            expect(new shadowsocks_config_1.Password('').data).toEqual('');
        });
        it('accepts empty or undefined tag', function () {
            expect(new shadowsocks_config_1.Tag('').data).toEqual('');
            expect(new shadowsocks_config_1.Tag().data).toEqual('');
        });
        it('throws on Config with missing or invalid fields', function () {
            expect(function () { return shadowsocks_config_1.makeConfig({
                host: '192.168.100.1',
                port: '8989',
            }); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return shadowsocks_config_1.makeConfig({
                method: 'aes-128-gcm',
                password: 'test',
            }); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
        it('throw on invalid configs', function () {
            expect(function () { return shadowsocks_config_1.makeConfig({
                port: 'foo',
                method: 'aes-128-gcm',
            }); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
            expect(function () { return shadowsocks_config_1.makeConfig({
                port: '1337',
                method: 'foo',
            }); }).toThrowError(shadowsocks_config_1.InvalidConfigField);
        });
    });
    describe('URI serializer', function () {
        it('can serialize a SIP002 URI', function () {
            var config = shadowsocks_config_1.makeConfig({
                host: '192.168.100.1',
                port: '8888',
                method: 'aes-128-gcm',
                password: 'test',
                tag: 'Foo Bar',
            });
            expect(shadowsocks_config_1.SIP002_URI.stringify(config)).toEqual('ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888/#Foo%20Bar');
        });
        it('can serialize a SIP002 URI with IPv6 host', function () {
            var config = shadowsocks_config_1.makeConfig({
                host: '2001:0:ce49:7601:e866:efff:62c3:fffe',
                port: '8888',
                method: 'aes-128-gcm',
                password: 'test',
                tag: 'Foo Bar',
            });
            expect(shadowsocks_config_1.SIP002_URI.stringify(config)).toEqual('ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888/#Foo%20Bar');
        });
        it('can serialize a legacy base64 URI', function () {
            var config = shadowsocks_config_1.makeConfig({
                host: '192.168.100.1',
                port: '8888',
                method: 'bf-cfb',
                password: 'test',
                tag: 'Foo Bar',
            });
            expect(shadowsocks_config_1.LEGACY_BASE64_URI.stringify(config)).toEqual('ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar');
        });
    });
    describe('URI parser', function () {
        it('exposes a PROTOCOL property with value "ss:"', function () {
            expect(shadowsocks_config_1.SHADOWSOCKS_URI.PROTOCOL).toEqual('ss:');
        });
        it('can parse a valid SIP002 URI with IPv4 host', function () {
            var input = 'ss://YWVzLTEyOC1nY206dGVzdA==@192.168.100.1:8888#Foo%20Bar';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.method.data).toEqual('aes-128-gcm');
            expect(config.password.data).toEqual('test');
            expect(config.host.data).toEqual('192.168.100.1');
            expect(config.port.data).toEqual(8888);
            expect(config.tag.data).toEqual('Foo Bar');
        });
        it('can parse a valid SIP002 URI with IPv6 host', function () {
            var input = 'ss://YWVzLTEyOC1nY206dGVzdA==@[2001:0:ce49:7601:e866:efff:62c3:fffe]:8888';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.method.data).toEqual('aes-128-gcm');
            expect(config.password.data).toEqual('test');
            expect(config.host.data).toEqual('2001:0:ce49:7601:e866:efff:62c3:fffe');
            expect(config.port.data).toEqual(8888);
        });
        it('can parse a valid SIP002 URI with an arbitray query param', function () {
            var input = 'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?foo=1';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.extra.foo).toEqual('1');
        });
        it('can parse a valid SIP002 URI with a plugin param', function () {
            var input = 'ss://cmM0LW1kNTpwYXNzd2Q=@192.168.100.1:8888/?plugin=obfs-local%3Bobfs%3Dhttp';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.method.data).toEqual('rc4-md5');
            expect(config.password.data).toEqual('passwd');
            expect(config.host.data).toEqual('192.168.100.1');
            expect(config.port.data).toEqual(8888);
            expect(config.extra.plugin).toEqual('obfs-local;obfs=http');
        });
        it('can parse a valid legacy base64 URI with IPv4 host', function () {
            var input = 'ss://YmYtY2ZiOnRlc3RAMTkyLjE2OC4xMDAuMTo4ODg4#Foo%20Bar';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.method.data).toEqual('bf-cfb');
            expect(config.password.data).toEqual('test');
            expect(config.host.data).toEqual('192.168.100.1');
            expect(config.port.data).toEqual(8888);
            expect(config.tag.data).toEqual('Foo Bar');
        });
        it('can parse a valid legacy base64 URI with IPv6 host', function () {
            var input = 'ss://YmYtY2ZiOnRlc3RAWzIwMDE6MDpjZTQ5Ojc2MDE6ZTg2NjplZmZmOjYyYzM6ZmZmZV06ODg4OA';
            var config = shadowsocks_config_1.SHADOWSOCKS_URI.parse(input);
            expect(config.host.data).toEqual('2001:0:ce49:7601:e866:efff:62c3:fffe');
            expect(config.port.data).toEqual(8888);
            expect(config.method.data).toEqual('bf-cfb');
            expect(config.password.data).toEqual('test');
            expect(config.tag.data).toEqual('');
        });
        it('throws when parsing empty input', function () {
            expect(function () { return shadowsocks_config_1.SHADOWSOCKS_URI.parse(''); }).toThrowError(shadowsocks_config_1.InvalidUri);
        });
        it('throws when parsing invalid input', function () {
            expect(function () { return shadowsocks_config_1.SHADOWSOCKS_URI.parse('not a URI'); }).toThrowError(shadowsocks_config_1.InvalidUri);
            expect(function () { return shadowsocks_config_1.SHADOWSOCKS_URI.parse('ss://not-base64'); }).toThrowError(shadowsocks_config_1.InvalidUri);
        });
    });
});
