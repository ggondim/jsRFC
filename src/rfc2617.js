(function (RFC) {
	'use strict';
	
	var getReqr = function (opt_reqr) {
		return opt_reqr || new WebReqr();
	};
	
	var getObject = function (opt_object) {
		return opt_object || {};
	}
	
	var getHeader = function (headers, header) {
		if (typeof headers === 'function') {
			return headers(header);
		} else {
			return headers[header];
		}
	}
	
	var isNullOrWhitespace = function (value) {
		return (value || null) !== null 
			&& (typeof value !== 'string' 
				|| (typeof value === 'string' && value.trim() !== ''));
	}
	
	function ResultException(type, result, opt_reason) {
		this.type = type;
		this.result = result;
		this.reason = opt_reason;
	}
	
	// TODO: Digest authorization
	RFC.s2617 = {
		keywords: {
			AUTH_REQUEST_HEADER: 'Authorization',
			AUTH_RESPONSE_HEADER: 'WWW-Authenticate'
		},
		factories: {
			authRequestHeader: function (scheme, params) {}
		},
		// ================================
		basicAuthorization: {
			keys: {
				CHALLENGE_SCHEME: 'Basic'
			},
			factories: {
				credentials: function (username, password) {}
			}
		}
	}
	
	var s2617 = RFC.s2617;
	var basic = RFC.s2617.basicAuthorization;
	
	s2617.factories.authRequestHeader = function (scheme, params) {
		return {
			key: s2617.keywords.AUTH_REQUEST_HEADER,
			value: scheme + ' ' + params
		};
	};
	
	basic.factories.credentials = function (username, password) {
		return btoa(username + ':' + password);	
	};
	
	
	actions.factory = function(username, password, opt_request) {
		var credentials = s2617.credentialsTransform(
				s2617.credentialsScheme
					.replace('$username', username)
					.replace('$password', password));
		
		// TODO: include realm parameter
		var headerAuthorization = s2617.basicScheme.replace('%params', credentials);
					
		var options = getObject(opt_request);
		options.headers[s2617.headerAuthorizationRequest] = headerAuthorization;
		return options;
	}
	
	actions.request = function (url, username, password, opt_options) {
		var options = getObject(opt_options);				
		options.headers = actions.factory(username, password, options);
		return getReqr(options.reqr)
			.get(url, options)
			.then(actions.response, actions.response);
	}
	
	actions.response = function(result) {
		var authenticateHeader = getHeader(result.headers, s2617.headerAuthorizationResponse);
		if (result.status === 401 
			|| (!isNullOrWhitespace(authenticateHeader)	
				&& authenticateHeader.indexOf('error') > -1)) {
			// TODO: include reason
			throw new ResultException('NOT-AUTHORIZED', result);
		} else if (result.status >= 400) {
			throw new ResultException('UNDEFINED', result);
		}
		return result;
	}
	
})(RFC = RFC || {})