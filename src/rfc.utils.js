RFC = (function (RFC, WebReqr) { 
	'use strict';
	
	RFC.utils = {};
	
	RFC.utils.getReqr = function (opt_reqr) {
		return opt_reqr || new WebReqr();
	};
	
	RFC.utils.getObject = function (opt_object) {
		return opt_object || {};
	}
	
	RFC.utils.getValue = function (collection, key) {
		if (typeof collection === 'function') {
			return collection(key);
		} else {
			return collection[key];
		}
	}
	
	RFC.utils.setValue = function (collection, key, value) {
		if (typeof collection === 'function') {
			collection(key, value);
		} else {
			collection[key] = value;
		}
	}
	
	RFC.utils.setPair = function (collection, pair) {
		RFC.utils.setValue(collection, pair.key, pair.value);
	}
	
	RFC.utils.isNullOrWhitespace = function (value) {
		return (value || null) !== null 
			&& (typeof value !== 'string' 
				|| (typeof value === 'string' && value.trim() !== ''));
	}
	
	function ResultException(type, result, opt_reason) {
		this.type = type;
		this.result = result;
		this.reason = opt_reason;
	}	
	RFC.utils.ResultException = ResultException;
	
	return RFC; 
})((typeof RFC === "undefined") ? {} : RFC, WebReqr);