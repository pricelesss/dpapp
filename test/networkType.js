var assert = require('assert');
var Patch7_1 = require('../lib/patch-7.1');

describe("description", function(){
  it("ios should be ok", function(){
    // your code...
		assert.equal(Patch7_1._iOSNetworkType({
			type: "0",
			subType: ""
		}),"none");

		assert.equal(Patch7_1._iOSNetworkType({
			type: "85538",
			subType: ""
		}),"wifi");

		assert.equal(Patch7_1._iOSNetworkType({
			type: "327683",
			subType: "CTRadioAccessTechnologyEdge"
		}),"2g");

		assert.equal(Patch7_1._iOSNetworkType({
			type: "327683",
			subType: "CTRadioAccessTechnologyHSDPA"
		}),"3g");

		assert.equal(Patch7_1._iOSNetworkType({
			type: "327683",
			subType: "CTRadioAccessTechnologyLTE"
		}),"4g");
  });


  it("android should be ok", function(){

		assert.equal(Patch7_1._androidNetworkType({
		}),"none");

		assert.equal(Patch7_1._androidNetworkType({
			type: 1,
			subType: 0
		}),"wifi");

		assert.equal(Patch7_1._androidNetworkType({
			type: 0,
			subType: 4
		}),"2g");

		assert.equal(Patch7_1._androidNetworkType({
			type: 0,
			subType: 8
		}),"3g");

		assert.equal(Patch7_1._androidNetworkType({
			type: 0,
			subType: 13
		}),"4g");
  });
});