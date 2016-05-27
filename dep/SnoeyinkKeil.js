(function (console, $hx_exports) { "use strict";
$hx_exports.hxGeomAlgo = $hx_exports.hxGeomAlgo || {};
var $estr = function() { return js_Boot.__string_rec(this,''); };
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var Type = function() { };
Type.__name__ = true;
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_ds_IntMap = function() {
	this.h = { };
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
};
var hxGeomAlgo_Debug = function() { };
hxGeomAlgo_Debug.__name__ = true;
hxGeomAlgo_Debug.assert = function(cond,message,pos) {
	return;
};
var hxGeomAlgo_HomogCoord = function(x,y,w) {
	if(w == null) w = 1;
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
	this.w = w;
};
hxGeomAlgo_HomogCoord.__name__ = true;
hxGeomAlgo_HomogCoord.det = function(p,q,r) {
	return p.w * q.perpdot(r) - q.w * p.perpdot(r) + r.w * p.perpdot(q);
};
hxGeomAlgo_HomogCoord.ccw = function(p,q,r) {
	return hxGeomAlgo_HomogCoord.det(p,q,r) > 0;
};
hxGeomAlgo_HomogCoord.cw = function(p,q,r) {
	return hxGeomAlgo_HomogCoord.det(p,q,r) < 0;
};
hxGeomAlgo_HomogCoord.prototype = {
	add: function(p) {
		this.x += p.x;
		this.y += p.y;
		return this;
	}
	,sub: function(p) {
		this.x -= p.x;
		this.y -= p.y;
		return this;
	}
	,neg: function() {
		this.w = -this.w;
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}
	,mul: function(m) {
		this.w *= m;
		this.x *= m;
		this.y *= m;
		return this;
	}
	,div: function(m) {
		this.w /= m;
		this.x /= m;
		this.y /= m;
		return this;
	}
	,normalize: function() {
		return this.div(this.length());
	}
	,lengthSquared: function() {
		return this.x * this.x + this.y * this.y;
	}
	,length: function() {
		return Math.sqrt(this.lengthSquared());
	}
	,perp: function() {
		var tmp = -this.y;
		this.y = this.x;
		this.x = tmp;
		return this;
	}
	,dotPoint: function(p) {
		return this.w + this.x * p.x + this.y * p.y;
	}
	,dot: function(p) {
		return this.w * p.w + this.x * p.x + this.y * p.y;
	}
	,perpdot: function(p) {
		return this.x * p.y - this.y * p.x;
	}
	,dotperp: function(p) {
		return -this.x * p.y + this.y * p.x;
	}
	,equals: function(p) {
		return p.w * this.x == this.w * p.x && p.w * this.y == this.w * p.y;
	}
	,left: function(p) {
		return this.dotPoint(p) > 0;
	}
	,right: function(p) {
		return this.dotPoint(p) < 0;
	}
	,toScreen: function() {
		return hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(this.x / this.w,-this.y / this.w);
	}
	,toPoint: function() {
		return hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(this.x / this.w,this.y / this.w);
	}
	,meet: function(p) {
		return new hxGeomAlgo_HomogCoord(p.w * this.y - this.w * p.y,this.w * p.x - p.w * this.x,this.x * p.y - this.y * p.x);
	}
	,meetPoint: function(p) {
		return new hxGeomAlgo_HomogCoord(this.y - this.w * p.y,this.w * p.x - this.x,this.x * p.y - this.y * p.x);
	}
	,toString: function() {
		return " (w:" + this.w + "; x:" + this.x + ", y:" + this.y + ")  ";
	}
};
var hxGeomAlgo__$HxPoint_HxPoint_$Impl_$ = {};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.__name__ = true;
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.get_x = function(this1) {
	return this1.x;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.set_x = function(this1,value) {
	return this1.x = value;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.get_y = function(this1) {
	return this1.y;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.set_y = function(this1,value) {
	return this1.y = value;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	return new hxGeomAlgo_HxPointData(x,y);
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.setTo = function(this1,newX,newY) {
	this1.x = newX;
	this1.y = newY;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.equals = function(this1,p) {
	return p != null && this1.x == p.x && this1.y == p.y;
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.clone = function(this1) {
	return hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(this1.x,this1.y);
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.toString = function(this1) {
	return "(" + this1.x + ", " + this1.y + ")";
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.fromPointStruct = function(p) {
	return hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(p.x,p.y);
};
hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.toPointStruct = function(this1) {
	return { x : this1.x, y : this1.y};
};
var hxGeomAlgo_HxPointData = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
hxGeomAlgo_HxPointData.__name__ = true;
hxGeomAlgo_HxPointData.prototype = {
	toString: function() {
		return "(" + this.x + ", " + this.y + ")";
	}
};
var hxGeomAlgo_PairDeque = function() {
	this.lastIdx = this.frontTopIdx = -1;
	this.backTopIdx = 0;
	this.front = [];
	this.back = [];
};
hxGeomAlgo_PairDeque.__name__ = true;
hxGeomAlgo_PairDeque.prototype = {
	push: function(i,j) {
		if(this.front.length <= ++this.frontTopIdx) {
			this.front.push(-1);
			this.back.push(-1);
		}
		this.front[this.frontTopIdx] = i;
		this.back[this.frontTopIdx] = j;
		this.lastIdx = this.frontTopIdx;
	}
	,pushNarrow: function(i,j) {
		if(!this.isFrontEmpty() && i <= this.frontTop()) return;
		while(!this.isFrontEmpty() && this.backBottom() >= j) this.popFront();
		this.push(i,j);
	}
	,isFrontEmpty: function() {
		return this.frontTopIdx < 0;
	}
	,frontHasNext: function() {
		return this.frontTopIdx > 0;
	}
	,flush: function() {
		this.lastIdx = this.frontTopIdx = -1;
	}
	,frontTop: function() {
		if(this.frontTopIdx < 0) return 0;
		return this.front[this.frontTopIdx];
	}
	,frontPeekNext: function() {
		return this.front[this.frontTopIdx - 1];
	}
	,backBottom: function() {
		return this.back[this.frontTopIdx];
	}
	,popFront: function() {
		return this.front[this.frontTopIdx--];
	}
	,restore: function() {
		this.backTopIdx = 0;
		this.frontTopIdx = this.lastIdx;
	}
	,isBackEmpty: function() {
		return this.backTopIdx > this.lastIdx;
	}
	,backHasNext: function() {
		return this.backTopIdx < this.lastIdx;
	}
	,frontBottom: function() {
		return this.front[this.backTopIdx];
	}
	,backPeekNext: function() {
		return this.back[this.backTopIdx + 1];
	}
	,backTop: function() {
		return this.back[this.backTopIdx];
	}
	,popBack: function() {
		return this.back[this.backTopIdx++];
	}
	,toString: function() {
		var stringBuffer_b = "";
		stringBuffer_b += Std.string("fp:" + this.frontTopIdx + ", bp:" + this.backTopIdx + ", last:" + this.lastIdx + ": ");
		var _g1 = 0;
		var _g = this.lastIdx + 1;
		while(_g1 < _g) {
			var i = _g1++;
			stringBuffer_b += Std.string(this.front[i] + "," + this.back[i] + "  ");
		}
		return stringBuffer_b;
	}
};
var hxGeomAlgo_PolyTools = $hx_exports.hxGeomAlgo.PolyTools = function() { };
hxGeomAlgo_PolyTools.__name__ = true;
hxGeomAlgo_PolyTools.isCCW = function(poly) {
	if(poly.length <= 2) return true;
	var signedArea = 0.;
	var _g1 = 0;
	var _g = poly.length;
	while(_g1 < _g) {
		var i = _g1++;
		signedArea += (function($this) {
			var $r;
			var this1 = hxGeomAlgo_PolyTools.at(poly,i - 1);
			$r = this1.x;
			return $r;
		}(this)) * poly[i].y - poly[i].x * (function($this) {
			var $r;
			var this2 = hxGeomAlgo_PolyTools.at(poly,i - 1);
			$r = this2.y;
			return $r;
		}(this));
	}
	return signedArea < 0;
};
hxGeomAlgo_PolyTools.makeCCW = function(poly) {
	var reversed = false;
	if(!hxGeomAlgo_PolyTools.isCCW(poly)) {
		poly.reverse();
		reversed = true;
	}
	return reversed;
};
hxGeomAlgo_PolyTools.makeCW = function(poly) {
	var reversed = false;
	if(hxGeomAlgo_PolyTools.isCCW(poly)) {
		poly.reverse();
		reversed = true;
	}
	return reversed;
};
hxGeomAlgo_PolyTools.isConvex = function(poly) {
	var isPositive = null;
	var _g1 = 0;
	var _g = poly.length;
	while(_g1 < _g) {
		var i = _g1++;
		var lower;
		if(i == 0) lower = poly.length - 1; else lower = i - 1;
		var middle = i;
		var upper;
		if(i == poly.length - 1) upper = 0; else upper = i + 1;
		var dx0 = poly[middle].x - poly[lower].x;
		var dy0 = poly[middle].y - poly[lower].y;
		var dx1 = poly[upper].x - poly[middle].x;
		var dy1 = poly[upper].y - poly[middle].y;
		var cross = dx0 * dy1 - dx1 * dy0;
		var newIsPositive;
		if(cross > 0) newIsPositive = true; else newIsPositive = false;
		if(cross == 0) continue;
		if(isPositive == null) isPositive = newIsPositive; else if(isPositive != newIsPositive) return false;
	}
	return true;
};
hxGeomAlgo_PolyTools.isSimple = function(poly) {
	var len = poly.length;
	if(len <= 3) return true;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		var p0 = i;
		var p1;
		if(i == len - 1) p1 = 0; else p1 = i + 1;
		var _g1 = i + 1;
		while(_g1 < len) {
			var j = _g1++;
			var q0 = j;
			var q1;
			if(j == len - 1) q1 = 0; else q1 = j + 1;
			var intersection = hxGeomAlgo_PolyTools.segmentIntersect(poly[p0],poly[p1],poly[q0],poly[q1]);
			if(intersection != null && !(hxGeomAlgo_PolyTools.distance(intersection,poly[p0]) < hxGeomAlgo_PolyTools.EPSILON || hxGeomAlgo_PolyTools.distance(intersection,poly[p1]) < hxGeomAlgo_PolyTools.EPSILON) && !(hxGeomAlgo_PolyTools.distance(intersection,poly[q0]) < hxGeomAlgo_PolyTools.EPSILON || hxGeomAlgo_PolyTools.distance(intersection,poly[q1]) < hxGeomAlgo_PolyTools.EPSILON)) return false;
		}
	}
	return true;
};
hxGeomAlgo_PolyTools.segmentIntersect = function(p0,p1,q0,q1) {
	var intersectionPoint;
	var a1;
	var a2;
	var b1;
	var b2;
	var c1;
	var c2;
	a1 = p1.y - p0.y;
	b1 = p0.x - p1.x;
	c1 = p1.x * p0.y - p0.x * p1.y;
	a2 = q1.y - q0.y;
	b2 = q0.x - q1.x;
	c2 = q1.x * q0.y - q0.x * q1.y;
	var denom = a1 * b2 - a2 * b1;
	if(denom == 0) return null;
	intersectionPoint = hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new();
	intersectionPoint.x = (b1 * c2 - b2 * c1) / denom;
	intersectionPoint.y = (a2 * c1 - a1 * c2) / denom;
	var p0p1 = hxGeomAlgo_PolyTools.sqr(p0.x - p1.x) + hxGeomAlgo_PolyTools.sqr(p0.y - p1.y);
	var q0q1 = hxGeomAlgo_PolyTools.sqr(q0.x - q1.x) + hxGeomAlgo_PolyTools.sqr(q0.y - q1.y);
	if(hxGeomAlgo_PolyTools.sqr(intersectionPoint.x - p1.x) + hxGeomAlgo_PolyTools.sqr(intersectionPoint.y - p1.y) > p0p1) return null;
	if(hxGeomAlgo_PolyTools.sqr(intersectionPoint.x - p0.x) + hxGeomAlgo_PolyTools.sqr(intersectionPoint.y - p0.y) > p0p1) return null;
	if(hxGeomAlgo_PolyTools.sqr(intersectionPoint.x - q1.x) + hxGeomAlgo_PolyTools.sqr(intersectionPoint.y - q1.y) > q0q1) return null;
	if(hxGeomAlgo_PolyTools.sqr(intersectionPoint.x - q0.x) + hxGeomAlgo_PolyTools.sqr(intersectionPoint.y - q0.y) > q0q1) return null;
	return intersectionPoint;
};
hxGeomAlgo_PolyTools.findDuplicatePoints = function(poly,consecutiveOnly,wrapAround) {
	if(wrapAround == null) wrapAround = true;
	if(consecutiveOnly == null) consecutiveOnly = true;
	var len = poly.length;
	if(len <= 1) return [];
	var dupIndices = [];
	var _g1 = 0;
	var _g = len - 1;
	while(_g1 < _g) {
		var i = _g1++;
		var j = i + 1;
		while(j < len) {
			var foundDup;
			var this1 = poly[i];
			var p = poly[j];
			foundDup = p != null && this1.x == p.x && this1.y == p.y;
			if(foundDup) dupIndices.push(i);
			if(consecutiveOnly || foundDup && !consecutiveOnly) break;
			j++;
		}
	}
	if(wrapAround && consecutiveOnly && (function($this) {
		var $r;
		var this2 = poly[0];
		var p1 = poly[len - 1];
		$r = p1 != null && this2.x == p1.x && this2.y == p1.y;
		return $r;
	}(this))) dupIndices.push(len - 1);
	return dupIndices;
};
hxGeomAlgo_PolyTools.intersection = function(p1,p2,q1,q2) {
	var res = null;
	var a1 = p2.y - p1.y;
	var b1 = p1.x - p2.x;
	var c1 = a1 * p1.x + b1 * p1.y;
	var a2 = q2.y - q1.y;
	var b2 = q1.x - q2.x;
	var c2 = a2 * q1.x + b2 * q1.y;
	var det = a1 * b2 - a2 * b1;
	if(!(Math.abs(det) <= hxGeomAlgo_PolyTools.EPSILON)) {
		res = hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new();
		res.x = (b2 * c1 - b1 * c2) / det;
		res.y = (a1 * c2 - a2 * c1) / det;
	}
	return res;
};
hxGeomAlgo_PolyTools.isReflex = function(poly,idx) {
	return hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(poly,idx - 1),hxGeomAlgo_PolyTools.at(poly,idx),hxGeomAlgo_PolyTools.at(poly,idx + 1));
};
hxGeomAlgo_PolyTools.at = function(poly,idx) {
	var len = poly.length;
	while(idx < 0) idx += len;
	return poly[idx % len];
};
hxGeomAlgo_PolyTools.side = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y);
};
hxGeomAlgo_PolyTools.isLeft = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) > 0;
};
hxGeomAlgo_PolyTools.isLeftOrOn = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) >= 0;
};
hxGeomAlgo_PolyTools.isRight = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) < 0;
};
hxGeomAlgo_PolyTools.isRightOrOn = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) <= 0;
};
hxGeomAlgo_PolyTools.isCollinear = function(p,a,b) {
	return (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) == 0;
};
hxGeomAlgo_PolyTools.distance = function(v,w) {
	return Math.sqrt(hxGeomAlgo_PolyTools.sqr(v.x - w.x) + hxGeomAlgo_PolyTools.sqr(v.y - w.y));
};
hxGeomAlgo_PolyTools.distanceToSegment = function(p,v,w) {
	return Math.sqrt(hxGeomAlgo_PolyTools.distanceToSegmentSquared(p,v,w));
};
hxGeomAlgo_PolyTools.distanceSquared = function(v,w) {
	return hxGeomAlgo_PolyTools.sqr(v.x - w.x) + hxGeomAlgo_PolyTools.sqr(v.y - w.y);
};
hxGeomAlgo_PolyTools.distanceToSegmentSquared = function(p,v,w) {
	var l2 = hxGeomAlgo_PolyTools.sqr(v.x - w.x) + hxGeomAlgo_PolyTools.sqr(v.y - w.y);
	if(l2 == 0) return hxGeomAlgo_PolyTools.sqr(p.x - v.x) + hxGeomAlgo_PolyTools.sqr(p.y - v.y);
	var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	if(t < 0) return hxGeomAlgo_PolyTools.sqr(p.x - v.x) + hxGeomAlgo_PolyTools.sqr(p.y - v.y);
	if(t > 1) return hxGeomAlgo_PolyTools.sqr(p.x - w.x) + hxGeomAlgo_PolyTools.sqr(p.y - w.y);
	hxGeomAlgo__$HxPoint_HxPoint_$Impl_$.setTo(hxGeomAlgo_PolyTools.point,v.x + t * (w.x - v.x),v.y + t * (w.y - v.y));
	return hxGeomAlgo_PolyTools.distanceSquared(p,hxGeomAlgo_PolyTools.point);
};
hxGeomAlgo_PolyTools.meet = function(p,q) {
	return new hxGeomAlgo_HomogCoord(p.y - q.y,q.x - p.x,p.x * q.y - p.y * q.x);
};
hxGeomAlgo_PolyTools.dot = function(p,q) {
	return p.x * q.x + p.y * q.y;
};
hxGeomAlgo_PolyTools.sqr = function(x) {
	return x * x;
};
hxGeomAlgo_PolyTools.eq = function(a,b) {
	return Math.abs(a - b) <= hxGeomAlgo_PolyTools.EPSILON;
};
hxGeomAlgo_PolyTools.clear = function(array) {
	array.length = 0;
};
hxGeomAlgo_PolyTools.toFloatArray = function(poly,out) {
	if(out != null) out = out; else out = [];
	var _g = 0;
	while(_g < poly.length) {
		var p = poly[_g];
		++_g;
		out.push(p.x);
		out.push(p.y);
	}
	return out;
};
hxGeomAlgo_PolyTools.reverseFloatArray = function(poly,inPlace) {
	if(inPlace == null) inPlace = false;
	var res;
	if(inPlace) res = poly; else res = [];
	var nPoints = poly.length >> 1;
	var _g = 0;
	while(_g < nPoints) {
		var i = _g++;
		var xPos = (nPoints - i - 1) * 2;
		res[i * 2] = poly[xPos];
		res[i * 2 + 1] = poly[xPos + 1];
	}
	return res;
};
hxGeomAlgo_PolyTools.flatten = function(array,out) {
	var res;
	if(out != null) res = out; else res = [];
	var _g = 0;
	while(_g < array.length) {
		var arr = array[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < arr.length) {
			var item = arr[_g1];
			++_g1;
			res.push(item);
		}
	}
	return res;
};
hxGeomAlgo_PolyTools.toPointArray = function(poly,out) {
	if(out != null) out = out; else out = [];
	var size = poly.length;
	if(poly.length % 2 == 1) size--;
	var _g1 = 0;
	var _g = size >> 1;
	while(_g1 < _g) {
		var i = _g1++;
		out.push(hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(poly[i * 2],poly[i * 2 + 1]));
	}
	return out;
};
hxGeomAlgo_PolyTools.inflateLine = function(start,end,thickness) {
	var halfWidth = thickness / 2;
	var dx = end.x - start.x;
	var dy = end.y - start.y;
	var len = Math.sqrt(dx * dx + dy * dy);
	var nx = dx / len * halfWidth;
	var ny = dy / len * halfWidth;
	return [hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(start.x - ny,start.y + nx),hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(end.x - ny,end.y + nx),hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(end.x + ny,end.y - nx),hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(start.x + ny,start.y - nx)];
};
hxGeomAlgo_PolyTools.exposeEnum = function(enumClass,$as) {
	var dotPath = ($as != null?$as:Type.getEnumName(enumClass)).split(".");
	var exports = $hx_exports;
	var i = 0;
	while(i < dotPath.length - 1) {
		var currPath = dotPath[i];
		exports[currPath] = exports[currPath] || { };
		exports = exports[currPath];
		i++;
	}
	exports[dotPath[i]] = enumClass;
};
var hxGeomAlgo_SnoeyinkKeil = $hx_exports.hxGeomAlgo.SnoeyinkKeil = function() { };
hxGeomAlgo_SnoeyinkKeil.__name__ = true;
hxGeomAlgo_SnoeyinkKeil.decomposePoly = function(simplePoly) {
	var res = [];
	var indices = hxGeomAlgo_SnoeyinkKeil.decomposePolyIndices(simplePoly);
	var _g = 0;
	while(_g < indices.length) {
		var polyIndices = indices[_g];
		++_g;
		var currPoly = [];
		res.push(currPoly);
		var _g1 = 0;
		while(_g1 < polyIndices.length) {
			var idx = polyIndices[_g1];
			++_g1;
			currPoly.push(simplePoly[idx]);
		}
	}
	return res;
};
hxGeomAlgo_SnoeyinkKeil.decomposePolyIndices = function(simplePoly) {
	var res = [];
	if(simplePoly.length < 3) return res;
	hxGeomAlgo_SnoeyinkKeil.poly = [];
	var _g = 0;
	while(_g < simplePoly.length) {
		var p = simplePoly[_g];
		++_g;
		hxGeomAlgo_SnoeyinkKeil.poly.push(hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(p.x,p.y));
	}
	hxGeomAlgo_SnoeyinkKeil.reversed = hxGeomAlgo_PolyTools.makeCW(hxGeomAlgo_SnoeyinkKeil.poly);
	var i;
	var j;
	var k;
	var n = hxGeomAlgo_SnoeyinkKeil.poly.length;
	var decomp = new hxGeomAlgo_DecompPoly(hxGeomAlgo_SnoeyinkKeil.poly);
	decomp.init();
	var _g1 = 3;
	while(_g1 < n) {
		var l = _g1++;
		i = decomp.reflexIter();
		while(i + l < n) {
			if(decomp.visible(i,k = i + l)) {
				decomp.initPairs(i,k);
				if(decomp.isReflex(k)) {
					var _g11 = i + 1;
					while(_g11 < k) {
						var j1 = _g11++;
						decomp.typeA(i,j1,k);
					}
				} else {
					j = decomp.reflexIter(i + 1);
					while(j < k - 1) {
						decomp.typeA(i,j,k);
						j = decomp.reflexNext(j);
					}
					decomp.typeA(i,k - 1,k);
				}
			}
			i = decomp.reflexNext(i);
		}
		k = decomp.reflexIter(l);
		while(k < n) {
			if(!decomp.isReflex(i = k - l) && decomp.visible(i,k)) {
				decomp.initPairs(i,k);
				decomp.typeB(i,i + 1,k);
				j = decomp.reflexIter(i + 2);
				while(j < k) {
					decomp.typeB(i,j,k);
					j = decomp.reflexNext(j);
				}
			}
			k = decomp.reflexNext(k);
		}
	}
	decomp.guard = 3 * n;
	decomp.recoverSolution(0,n - 1);
	res = decomp.decompIndices();
	if(hxGeomAlgo_SnoeyinkKeil.reversed) {
		var _g2 = 0;
		while(_g2 < res.length) {
			var poly = res[_g2];
			++_g2;
			var _g21 = 0;
			var _g12 = poly.length;
			while(_g21 < _g12) {
				var i1 = _g21++;
				poly[i1] = n - poly[i1] - 1;
			}
		}
	}
	return res;
};
var hxGeomAlgo_DecompPoly = function(poly) {
	this._polys = [];
	this._indicesSet = new haxe_ds_IntMap();
	this.poly = poly;
	this.n = poly.length;
};
hxGeomAlgo_DecompPoly.__name__ = true;
hxGeomAlgo_DecompPoly.prototype = {
	init: function() {
		this.initReflex();
		this.subDecomp = new hxGeomAlgo_SubDecomp(this._reflexFlag);
		this.initVisibility();
		this.initSubProblems();
	}
	,initReflex: function() {
		this._reflexFlag = [];
		this._reflexNext = [];
		var _g1 = 0;
		var _g = this.n;
		while(_g1 < _g) {
			var i1 = _g1++;
			this._reflexFlag[i1] = false;
			this._reflexNext[i1] = -1;
		}
		var wrap = 0;
		this._reflexFlag[wrap] = true;
		var i = this.n - 1;
		while(i > 0) {
			this._reflexFlag[i] = hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(this.poly,i - 1),hxGeomAlgo_PolyTools.at(this.poly,i),hxGeomAlgo_PolyTools.at(this.poly,wrap));
			wrap = i;
			i--;
		}
		this._reflexFirst = this.n;
		i = this.n - 1;
		while(i >= 0) {
			this._reflexNext[i] = this._reflexFirst;
			if(this.isReflex(i)) this._reflexFirst = i;
			i--;
		}
	}
	,isReflex: function(i) {
		return this._reflexFlag[i];
	}
	,reflexNext: function(i) {
		return this._reflexNext[i];
	}
	,reflexIter: function(n) {
		if(n == null || n <= 0) return this._reflexFirst;
		if(n > this._reflexNext.length) return this._reflexNext.length;
		return this._reflexNext[n - 1];
	}
	,visible: function(i,j) {
		return this.subDecomp.weight(i,j) < hxGeomAlgo_DecompPoly.BAD;
	}
	,initVisibility: function() {
		var visIndices;
		var i = this.reflexIter();
		while(i < this.n) {
			visIndices = hxGeomAlgo_Visibility.getVisibleIndicesFrom(this.poly,i);
			while(visIndices.length > 0) {
				var j = visIndices.pop();
				if(j < i) this.subDecomp.setWeight(j,i,hxGeomAlgo_DecompPoly.INFINITY); else this.subDecomp.setWeight(i,j,hxGeomAlgo_DecompPoly.INFINITY);
			}
			i = this._reflexNext[i];
		}
	}
	,setAfter: function(i) {
		hxGeomAlgo_Debug.assert(this.isReflex(i),"Non reflex i in setAfter(" + i + ")",{ fileName : "SnoeyinkKeil.hx", lineNumber : 220, className : "hxGeomAlgo.DecompPoly", methodName : "setAfter"});
		this.subDecomp.setWeight(i,i + 1,0);
		if(this.visible(i,i + 2)) this.subDecomp.initWithWeight(i,i + 2,0,i + 1,i + 1);
	}
	,setBefore: function(i) {
		hxGeomAlgo_Debug.assert(this.isReflex(i),"Non reflex i in setBefore(" + i + ")",{ fileName : "SnoeyinkKeil.hx", lineNumber : 226, className : "hxGeomAlgo.DecompPoly", methodName : "setBefore"});
		this.subDecomp.setWeight(i - 1,i,0);
		if(this.visible(i - 2,i)) this.subDecomp.initWithWeight(i - 2,i,0,i - 1,i - 1);
	}
	,initSubProblems: function() {
		var i;
		i = this.reflexIter();
		if(i == 0) {
			this.setAfter(i);
			i = this._reflexNext[i];
		}
		if(i == 1) {
			this.subDecomp.setWeight(0,1,0);
			this.setAfter(i);
			i = this._reflexNext[i];
		}
		while(i < this.n - 2) {
			this.setBefore(i);
			this.setAfter(i);
			i = this._reflexNext[i];
		}
		if(i == this.n - 2) {
			this.setBefore(i);
			this.subDecomp.setWeight(i,i + 1,0);
			i = this._reflexNext[i];
		}
		if(i == this.n - 1) this.setBefore(i);
	}
	,initPairs: function(i,k) {
		this.subDecomp.init(i,k);
	}
	,recoverSolution: function(i,k) {
		var j;
		this.guard--;
		if(k - i <= 1) return;
		var pair = this.subDecomp.pairs(i,k);
		if(this.isReflex(i)) {
			j = pair.backTop();
			this.recoverSolution(j,k);
			if(j - i > 1) {
				if(pair.frontBottom() != pair.backTop()) {
					var pd = this.subDecomp.pairs(i,j);
					pd.restore();
					while(!pd.isBackEmpty() && pair.frontBottom() != pd.frontBottom()) pd.popBack();
				}
				this.recoverSolution(i,j);
			}
		} else {
			j = pair.frontTop();
			this.recoverSolution(i,j);
			if(k - j > 1) {
				if(pair.frontTop() != pair.backBottom()) {
					var pd1 = this.subDecomp.pairs(j,k);
					pd1.restore();
					while(!pd1.isFrontEmpty() && pair.backBottom() != pd1.backBottom()) pd1.popFront();
				}
				this.recoverSolution(j,k);
			}
		}
	}
	,typeA: function(i,j,k) {
		if(!this.visible(i,j)) return;
		var top = j;
		var w = this.subDecomp.weight(i,j);
		if(k - j > 1) {
			if(!this.visible(j,k)) return;
			w += this.subDecomp.weight(j,k) + 1;
		}
		if(j - i > 1) {
			var pair = this.subDecomp.pairs(i,j);
			if(!hxGeomAlgo_PolyTools.isLeft(hxGeomAlgo_PolyTools.at(this.poly,k),hxGeomAlgo_PolyTools.at(this.poly,j),hxGeomAlgo_PolyTools.at(this.poly,pair.backTop()))) {
				while(pair.backHasNext() && !hxGeomAlgo_PolyTools.isLeft(hxGeomAlgo_PolyTools.at(this.poly,k),hxGeomAlgo_PolyTools.at(this.poly,j),hxGeomAlgo_PolyTools.at(this.poly,pair.backPeekNext()))) pair.popBack();
				if(!pair.isBackEmpty() && !hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(this.poly,k),hxGeomAlgo_PolyTools.at(this.poly,i),hxGeomAlgo_PolyTools.at(this.poly,pair.frontBottom()))) top = pair.frontBottom(); else w++;
			} else w++;
		}
		this.update(i,k,w,top,j);
	}
	,typeB: function(i,j,k) {
		if(!this.visible(j,k)) return;
		var top = j;
		var w = this.subDecomp.weight(j,k);
		if(j - i > 1) {
			if(!this.visible(i,j)) return;
			w += this.subDecomp.weight(i,j) + 1;
		}
		if(k - j > 1) {
			var pair = this.subDecomp.pairs(j,k);
			if(!hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(this.poly,i),hxGeomAlgo_PolyTools.at(this.poly,j),hxGeomAlgo_PolyTools.at(this.poly,pair.frontTop()))) {
				while(pair.frontHasNext() && !hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(this.poly,i),hxGeomAlgo_PolyTools.at(this.poly,j),hxGeomAlgo_PolyTools.at(this.poly,pair.frontPeekNext()))) pair.popFront();
				if(!pair.isFrontEmpty() && !hxGeomAlgo_PolyTools.isLeft(hxGeomAlgo_PolyTools.at(this.poly,i),hxGeomAlgo_PolyTools.at(this.poly,k),hxGeomAlgo_PolyTools.at(this.poly,pair.backBottom()))) top = pair.backBottom(); else w++;
			} else w++;
		}
		this.update(i,k,w,j,top);
	}
	,update: function(a,b,w,i,j) {
		var ow = this.subDecomp.weight(a,b);
		if(w <= ow) {
			var pair = this.subDecomp.pairs(a,b);
			if(w < ow) {
				pair.flush();
				this.subDecomp.setWeight(a,b,w);
			}
			pair.pushNarrow(i,j);
		}
	}
	,_decompByDiags: function(i,k,outIndices,level) {
		if(level == null) level = 0;
		if(level == 0) {
			this._indicesSet.h[0] = true;
			this._indicesSet.h[this.poly.length - 1] = true;
		}
		var j;
		var ijReal = true;
		var jkReal = true;
		var nDiags = 0;
		if(k - i <= 1) return;
		var pair = this.subDecomp.pairs(i,k);
		if(this.isReflex(i)) {
			j = pair.backTop();
			ijReal = pair.frontBottom() == pair.backTop();
		} else {
			j = pair.frontTop();
			jkReal = pair.backBottom() == pair.frontTop();
		}
		if(ijReal) {
			this._indicesSet.h[i] = true;
			this._indicesSet.h[j] = true;
			nDiags++;
		}
		if(jkReal) {
			this._indicesSet.h[j] = true;
			this._indicesSet.h[k] = true;
			nDiags++;
		}
		this.guard--;
		if(nDiags > 1) {
			var hasInnerDiags = false;
			var indices;
			var _g = [];
			var $it0 = this._indicesSet.keys();
			while( $it0.hasNext() ) {
				var k1 = $it0.next();
				_g.push(k1);
			}
			indices = _g;
			indices.sort($bind(this,this.intCmp));
			if(indices.length > 0) {
				outIndices.push(indices);
				this._indicesCount = 0;
				this._indicesSet = new haxe_ds_IntMap();
			}
		}
		this._decompByDiags(i,j,outIndices,level + 1);
		this._decompByDiags(j,k,outIndices,level + 1);
	}
	,intCmp: function(a,b) {
		if(a == b) return 0; else if(b < a) return 1; else return -1;
	}
	,decompIndices: function() {
		var res = [];
		this.guard = 3 * this.n;
		this._decompByDiags(0,this.poly.length - 1,res);
		return res;
	}
	,toString: function() {
		return this.poly.length + ": " + this.poly.toString();
	}
};
var hxGeomAlgo_SubDecomp = function(reflex) {
	var n = reflex.length;
	var r = 0;
	var j;
	this.rx = [];
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		if(reflex[i]) this.rx[i] = r++; else this.rx[i] = 0;
	}
	j = r;
	this.wt = [];
	this.pd = [];
	var _g1 = 0;
	while(_g1 < n) {
		var i1 = _g1++;
		if(!reflex[i1]) this.rx[i1] = j++;
		this.wt[i1] = [];
		this.pd[i1] = [];
		var _g11 = 0;
		while(_g11 < n) {
			var k = _g11++;
			if(i1 < r || k < r) {
				this.wt[i1][k] = hxGeomAlgo_DecompPoly.BAD;
				this.pd[i1][k] = null;
			} else break;
		}
	}
};
hxGeomAlgo_SubDecomp.__name__ = true;
hxGeomAlgo_SubDecomp.prototype = {
	setWeight: function(i,j,w) {
		this.wt[this.rx[i]][this.rx[j]] = w;
	}
	,weight: function(i,j) {
		return this.wt[this.rx[i]][this.rx[j]];
	}
	,pairs: function(i,j) {
		return this.pd[this.rx[i]][this.rx[j]];
	}
	,init: function(i,j) {
		return this.pd[this.rx[i]][this.rx[j]] = new hxGeomAlgo_PairDeque();
	}
	,initWithWeight: function(i,j,w,a,b) {
		this.setWeight(i,j,w);
		this.init(i,j).push(a,b);
	}
};
var hxGeomAlgo_VertexType = { __ename__ : ["hxGeomAlgo","VertexType"], __constructs__ : ["UNKNOWN","RIGHT_LID","LEFT_LID","RIGHT_WALL","LEFT_WALL"] };
hxGeomAlgo_VertexType.UNKNOWN = ["UNKNOWN",0];
hxGeomAlgo_VertexType.UNKNOWN.toString = $estr;
hxGeomAlgo_VertexType.UNKNOWN.__enum__ = hxGeomAlgo_VertexType;
hxGeomAlgo_VertexType.RIGHT_LID = ["RIGHT_LID",1];
hxGeomAlgo_VertexType.RIGHT_LID.toString = $estr;
hxGeomAlgo_VertexType.RIGHT_LID.__enum__ = hxGeomAlgo_VertexType;
hxGeomAlgo_VertexType.LEFT_LID = ["LEFT_LID",2];
hxGeomAlgo_VertexType.LEFT_LID.toString = $estr;
hxGeomAlgo_VertexType.LEFT_LID.__enum__ = hxGeomAlgo_VertexType;
hxGeomAlgo_VertexType.RIGHT_WALL = ["RIGHT_WALL",3];
hxGeomAlgo_VertexType.RIGHT_WALL.toString = $estr;
hxGeomAlgo_VertexType.RIGHT_WALL.__enum__ = hxGeomAlgo_VertexType;
hxGeomAlgo_VertexType.LEFT_WALL = ["LEFT_WALL",4];
hxGeomAlgo_VertexType.LEFT_WALL.toString = $estr;
hxGeomAlgo_VertexType.LEFT_WALL.__enum__ = hxGeomAlgo_VertexType;
var hxGeomAlgo_Visibility = $hx_exports.hxGeomAlgo.Visibility = function() { };
hxGeomAlgo_Visibility.__name__ = true;
hxGeomAlgo_Visibility.getVisibleIndicesFrom = function(simplePoly,origIdx) {
	if(origIdx == null) origIdx = 0;
	var res = [];
	if(simplePoly.length <= 0) return res;
	hxGeomAlgo_Visibility.poly = [];
	hxGeomAlgo_Visibility.stack.length = 0;
	hxGeomAlgo_Visibility.vertexType.length = 0;
	hxGeomAlgo_Visibility.stackTop = -1;
	var _g1 = 0;
	var _g = simplePoly.length;
	while(_g1 < _g) {
		var i = _g1++;
		hxGeomAlgo_Visibility.poly.push(hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(simplePoly[i].x,simplePoly[i].y));
		hxGeomAlgo_Visibility.stack.push(-1);
		hxGeomAlgo_Visibility.vertexType.push(hxGeomAlgo_VertexType.UNKNOWN);
	}
	hxGeomAlgo_Visibility.reversed = hxGeomAlgo_PolyTools.makeCW(hxGeomAlgo_Visibility.poly);
	if(hxGeomAlgo_Visibility.reversed) origIdx = hxGeomAlgo_Visibility.poly.length - origIdx - 1;
	var edgeJ;
	hxGeomAlgo_Visibility.origPoint = hxGeomAlgo_Visibility.poly[origIdx];
	var j = origIdx;
	hxGeomAlgo_Visibility.push(j++,hxGeomAlgo_VertexType.RIGHT_WALL);
	do {
		hxGeomAlgo_Visibility.push(j++,hxGeomAlgo_VertexType.RIGHT_WALL);
		if(j >= hxGeomAlgo_Visibility.poly.length + origIdx) break;
		edgeJ = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j - 1),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j));
		if(edgeJ.left(hxGeomAlgo_Visibility.origPoint)) continue;
		if(!edgeJ.left(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j - 2))) {
			j = hxGeomAlgo_Visibility.exitRightBay(hxGeomAlgo_Visibility.poly,j,hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop]),hxGeomAlgo_HomogCoord.INFINITY);
			hxGeomAlgo_Visibility.push(j++,hxGeomAlgo_VertexType.RIGHT_LID);
			continue;
		}
		hxGeomAlgo_Visibility.saveLid();
		do if(hxGeomAlgo_PolyTools.isLeft(hxGeomAlgo_Visibility.origPoint,hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop]),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j))) {
			if(hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j + 1),hxGeomAlgo_Visibility.origPoint)) j++; else if(edgeJ.left(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j + 1))) j = hxGeomAlgo_Visibility.exitLeftBay(hxGeomAlgo_Visibility.poly,j,hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j),hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.leftLidIdx),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.leftLidIdx - 1))) + 1; else {
				hxGeomAlgo_Visibility.restoreLid();
				hxGeomAlgo_Visibility.push(j++,hxGeomAlgo_VertexType.LEFT_WALL);
				break;
			}
			edgeJ = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j - 1),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,j));
		} else if(!edgeJ.left(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop]))) {
			j = hxGeomAlgo_Visibility.exitRightBay(hxGeomAlgo_Visibility.poly,j,hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop]),edgeJ.neg());
			hxGeomAlgo_Visibility.push(j++,hxGeomAlgo_VertexType.RIGHT_LID);
			break;
		} else hxGeomAlgo_Visibility.saveLid(); while(true);
	} while(j < hxGeomAlgo_Visibility.poly.length + origIdx);
	var _g11 = 0;
	var _g2 = hxGeomAlgo_Visibility.stackTop + 1;
	while(_g11 < _g2) {
		var i1 = _g11++;
		if(hxGeomAlgo_Visibility.vertexType[i1] == hxGeomAlgo_VertexType.LEFT_WALL || hxGeomAlgo_Visibility.vertexType[i1] == hxGeomAlgo_VertexType.RIGHT_WALL) {
			var idx = hxGeomAlgo_Visibility.stack[i1] % hxGeomAlgo_Visibility.poly.length;
			if(hxGeomAlgo_Visibility.reversed) idx = hxGeomAlgo_Visibility.poly.length - idx - 1;
			res.push(idx);
		}
	}
	return res;
};
hxGeomAlgo_Visibility.getVisiblePolyFrom = function(simplePoly,origIdx) {
	if(origIdx == null) origIdx = 0;
	var indices = hxGeomAlgo_Visibility.getVisibleIndicesFrom(simplePoly,origIdx);
	var res = [];
	if(indices.length <= 0) return res;
	var q;
	var last = hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop]);
	var lastPushed = null;
	var lastType = hxGeomAlgo_VertexType.UNKNOWN;
	var vType = hxGeomAlgo_VertexType.UNKNOWN;
	var _g1 = 0;
	var _g = hxGeomAlgo_Visibility.stackTop + 1;
	while(_g1 < _g) {
		var i = _g1++;
		vType = hxGeomAlgo_Visibility.vertexType[i];
		if(vType == hxGeomAlgo_VertexType.RIGHT_LID) {
			q = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_Visibility.origPoint,last).meet(hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i]),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i + 1])));
			if(lastPushed != null && !(last != null && lastPushed.x == last.x && lastPushed.y == last.y)) res.push(hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(last.x,last.y));
			res.push(q.toPoint());
		} else if(vType == hxGeomAlgo_VertexType.LEFT_WALL) {
			q = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_Visibility.origPoint,hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i])).meet(hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i - 2]),hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i - 1])));
			res.push(q.toPoint());
		} else if(vType == hxGeomAlgo_VertexType.RIGHT_WALL && lastType == hxGeomAlgo_VertexType.RIGHT_LID || vType == hxGeomAlgo_VertexType.LEFT_LID && lastType == hxGeomAlgo_VertexType.RIGHT_LID) {
		} else res.push(hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(last.x,last.y));
		lastPushed = res[res.length - 1];
		last = hxGeomAlgo_PolyTools.at(hxGeomAlgo_Visibility.poly,hxGeomAlgo_Visibility.stack[i]);
		lastType = vType;
	}
	return res;
};
hxGeomAlgo_Visibility.exitRightBay = function(poly,j,bot,lid) {
	var windingNum = 0;
	var mouth = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_Visibility.origPoint,bot);
	var lastLeft;
	var currLeft = false;
	while(++j < 3 * poly.length) {
		lastLeft = currLeft;
		currLeft = mouth.left(hxGeomAlgo_PolyTools.at(poly,j));
		if(currLeft != lastLeft && hxGeomAlgo_PolyTools.isLeft(hxGeomAlgo_PolyTools.at(poly,j - 1),hxGeomAlgo_PolyTools.at(poly,j),hxGeomAlgo_Visibility.origPoint) == currLeft) {
			if(!currLeft) windingNum--; else if(windingNum++ == 0) {
				var edge = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(poly,j - 1),hxGeomAlgo_PolyTools.at(poly,j));
				if(edge.left(bot) && !hxGeomAlgo_HomogCoord.cw(mouth,edge,lid)) return j - 1;
			}
		}
	}
	return j;
};
hxGeomAlgo_Visibility.exitLeftBay = function(poly,j,bot,lid) {
	var windingNum = 0;
	var mouth = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_Visibility.origPoint,bot);
	var lastRight;
	var currRight = false;
	while(++j < 3 * poly.length) {
		lastRight = currRight;
		currRight = mouth.right(hxGeomAlgo_PolyTools.at(poly,j));
		if(currRight != lastRight && hxGeomAlgo_PolyTools.isRight(hxGeomAlgo_PolyTools.at(poly,j - 1),hxGeomAlgo_PolyTools.at(poly,j),hxGeomAlgo_Visibility.origPoint) == currRight) {
			if(!currRight) windingNum++; else if(windingNum-- == 0) {
				var edge = hxGeomAlgo_PolyTools.meet(hxGeomAlgo_PolyTools.at(poly,j - 1),hxGeomAlgo_PolyTools.at(poly,j));
				if(edge.right(bot) && !hxGeomAlgo_HomogCoord.cw(mouth,edge,lid)) return j - 1;
			}
		}
	}
	return j;
};
hxGeomAlgo_Visibility.push = function(idx,vType) {
	hxGeomAlgo_Visibility.stackTop++;
	hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop] = idx;
	hxGeomAlgo_Visibility.vertexType[hxGeomAlgo_Visibility.stackTop] = vType;
};
hxGeomAlgo_Visibility.saveLid = function() {
	if(hxGeomAlgo_Visibility.vertexType[hxGeomAlgo_Visibility.stackTop] == hxGeomAlgo_VertexType.LEFT_WALL) hxGeomAlgo_Visibility.stackTop--;
	hxGeomAlgo_Visibility.leftLidIdx = hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop--];
	if(hxGeomAlgo_Visibility.vertexType[hxGeomAlgo_Visibility.stackTop] == hxGeomAlgo_VertexType.RIGHT_LID) hxGeomAlgo_Visibility.rightLidIdx = hxGeomAlgo_Visibility.stack[hxGeomAlgo_Visibility.stackTop--]; else hxGeomAlgo_Visibility.rightLidIdx = -1;
};
hxGeomAlgo_Visibility.restoreLid = function() {
	if(hxGeomAlgo_Visibility.rightLidIdx != -1) hxGeomAlgo_Visibility.push(hxGeomAlgo_Visibility.rightLidIdx,hxGeomAlgo_VertexType.RIGHT_LID);
	hxGeomAlgo_Visibility.push(hxGeomAlgo_Visibility.leftLidIdx,hxGeomAlgo_VertexType.LEFT_LID);
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.__name__ = true;
Array.__name__ = true;
hxGeomAlgo_HomogCoord.INFINITY = new hxGeomAlgo_HomogCoord();
hxGeomAlgo_PolyTools.point = hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new();
hxGeomAlgo_PolyTools.zero = hxGeomAlgo__$HxPoint_HxPoint_$Impl_$._new(0,0);
hxGeomAlgo_PolyTools.EPSILON = .00000001;
hxGeomAlgo_DecompPoly.INFINITY = 100000;
hxGeomAlgo_DecompPoly.BAD = 999990;
hxGeomAlgo_DecompPoly.NONE = 0;
hxGeomAlgo_Visibility.NOT_SAVED = -1;
hxGeomAlgo_Visibility.stack = [];
hxGeomAlgo_Visibility.vertexType = [];
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : exports);
