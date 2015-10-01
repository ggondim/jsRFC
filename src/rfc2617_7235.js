// RFC 2617 implementation in JavaScript, also compliant with RFC 7235

(function (RFC, utils) {
	'use strict';
	
	RFC.s2617 = {
		keywords: {
			AUTH_REQUEST_HEADER: 'Authorization',
			AUTH_RESPONSE_HEADER: 'WWW-Authenticate'
		},
		bnf: {
			CREDENTIALS: '$authScheme $#authparam'	
		},
		messages: {
			CHALLENGE_NOT_SPECIFIED: '[RFC2617] Challenge not specified',
			ANOTHER_CHALLENGE: '[RFC2617] Another challenge was specified by the server, rather than the provided'
		},
		factories: {
			authRequestHeader: function (scheme, params) {}
		},
		// ================================ Section 2
		basicAuthorization: {
			keys: {
				CHALLENGE_SCHEME: 'Basic'
			},
			factories: {
				credentials: function (username, password) {}
			},
			actions: {}
		}
		// ================================ Section 3
		// TODO: Digest authorization
	}
	
	var s2617 = RFC.s2617;
	var basic = RFC.s2617.basicAuthorization;
	
	s2617.factories.authRequestHeader = function (authScheme, authparams) {
		return {
			key: s2617.keywords.AUTH_REQUEST_HEADER,
			value: s2617.bfn.CREDENTIALS
				.replace('$authScheme', authScheme)
				.replace('$#authParams', authparams)
		};
	};
		
	// ================================ Section 2: Basic Authorization
	
	basic.factories.credentials = function (username, password) {
		return btoa(username + ':' + password);	
	};
	
	basic.actions.requestResource = function (url, username, credentials, request) {
		var options = utils.getObject(request);
		utils.setPair(options.headers, s2617.factories.authRequestHeader(username, credentials));
		// TODO: validate reqr interface
		return utils.getReqr(options.reqr)
			.do(url, options)
			.then(basic.actions.response, basic.actions.response);
	}
	
	basic.actions.response = function (result) {
		var challenge = utils.getValue(result.headers, s2617.keywords.AUTH_RESPONSE_HEADER);
		if (result.status === 401 && utils.isNullOrWhitespace(challenge)) {
			throw new utils.ResultException(s2617.messages.CHALLENGE_NOT_SPECIFIED, result);
		} else if (result.status === 401 
			&& !utils.isNullOrWhitespace(challenge)
			&& challenge.indexOf(basic.keys.authScheme) == -1) {
			throw new utils.ResultException(s2617.messages.ANOTHER_CHALLENGE, result);
		} else if (result.status > 400) {
			throw new utils.ResultException('HTTP ' + result.status, result);
		} else {
			return result;
		}
	}
	
})(RFC, RFC.utils);