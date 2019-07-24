window.fgui = {};

window.__extends = this && this.__extends || function() {
var t = function(e, i) {
return (t = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
})(e, i);
};
return function(e, i) {
t(e, i);
function n() {
this.constructor = e;
}
e.prototype = null === i ? Object.create(i) : (n.prototype = i.prototype, new n());
};
}();

(function(t) {
var e = function() {
function e() {}
e.prototype.createObject = function(e, i) {
if (this._node) throw "Already running";
var n = t.UIPackage.getByName(e);
if (!n) throw new Error("package not found: " + e);
var o = n.getItemByName(i);
if (!o) throw new Error("resource not found: " + i);
this.internalCreateObject(o);
};
e.prototype.createObjectFromURL = function(e) {
if (this._node) throw "Already running";
var i = t.UIPackage.getItemByURL(e);
if (!i) throw new Error("resource not found: " + e);
this.internalCreateObject(i);
};
e.prototype.cancel = function() {
if (this._node) {
this._node.destroy();
this._node = null;
}
};
e.prototype.internalCreateObject = function(t) {
this._node = new cc.Node("[AsyncCreating:" + t.name + "]");
this._node.parent = cc.director.getScene();
this._node.on("#", this.completed, this);
this._node.addComponent(i).init(t);
};
e.prototype.completed = function(t) {
this.cancel();
this.callback && this.callback(t);
};
return e;
}();
t.AsyncOperation = e;
var i = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._itemList = new Array();
t._objectPool = new Array();
return t;
}
i.prototype.init = function(t) {
this._itemList.length = 0;
this._objectPool.length = 0;
var e = new n(t, 0);
e.childCount = this.collectComponentChildren(t);
this._itemList.push(e);
this._index = 0;
};
i.prototype.onDestroy = function() {
this._itemList.length = 0;
var t = this._objectPool.length;
if (t > 0) {
for (var e = 0; e < t; e++) this._objectPool[e].dispose();
this._objectPool.length = 0;
}
};
i.prototype.collectComponentChildren = function(e) {
var i, o, r, s, a, h, l = e.rawData;
l.seek(0, 2);
var c = l.readShort();
for (r = 0; r < c; r++) {
s = l.readShort();
a = l.position;
l.seek(a, 0);
var u = l.readByte(), _ = l.readS(), d = l.readS();
l.position = a;
if (null != _) {
o = null != (h = null != d ? t.UIPackage.getById(d) : e.owner) ? h.getItemById(_) : null;
i = new n(o, u);
null != o && o.type == t.PackageItemType.Component && (i.childCount = this.collectComponentChildren(o));
} else {
i = new n(null, u);
u == t.ObjectType.List && (i.listItemCount = this.collectListChildren(l));
}
this._itemList.push(i);
l.position = a + s;
}
return c;
};
i.prototype.collectListChildren = function(e) {
e.seek(e.position, 8);
var i, o, r, s, a, h = 0, l = e.readS(), c = e.readShort();
for (i = 0; i < c; i++) {
o = e.readShort();
o += e.position;
null == (r = e.readS()) && (r = l);
if (r && null != (s = t.UIPackage.getItemByURL(r))) {
a = new n(s, s.objectType);
s.type == t.PackageItemType.Component && (a.childCount = this.collectComponentChildren(s));
this._itemList.push(a);
h++;
}
e.position = o;
}
return h;
};
i.prototype.update = function() {
for (var e, i, n, o, r = t.ToolSet.getTime(), s = t.UIConfig.frameTimeForAsyncUIConstruction, a = this._itemList.length; this._index < a; ) {
if (null != (i = this._itemList[this._index]).packageItem) {
(e = t.UIObjectFactory.newObject(i.packageItem)).packageItem = i.packageItem;
this._objectPool.push(e);
t.UIPackage._constructing++;
if (i.packageItem.type == t.PackageItemType.Component) {
n = this._objectPool.length - i.childCount - 1;
e.constructFromResource2(this._objectPool, n);
this._objectPool.splice(n, i.childCount);
} else e.constructFromResource();
t.UIPackage._constructing--;
} else {
e = t.UIObjectFactory.newObject2(i.type);
this._objectPool.push(e);
if (i.type == t.ObjectType.List && i.listItemCount > 0) {
n = this._objectPool.length - i.listItemCount - 1;
for (o = 0; o < i.listItemCount; o++) e.itemPool.returnObject(this._objectPool[o + n]);
this._objectPool.splice(n, i.listItemCount);
}
}
this._index++;
if (this._index % 5 == 0 && t.ToolSet.getTime() - r >= s) return;
}
var h = this._objectPool[0];
this._itemList.length = 0;
this._objectPool.length = 0;
this.node.emit("#", h);
};
return i;
}(cc.Component), n = function() {
return function(t, e) {
this.packageItem = t;
this.type = e;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._selectedIndex = 0;
t._previousIndex = 0;
t.changing = !1;
t._pageIds = [];
t._pageNames = [];
t._selectedIndex = -1;
t._previousIndex = -1;
return t;
}
i.prototype.dispose = function() {};
Object.defineProperty(i.prototype, "selectedIndex", {
get: function() {
return this._selectedIndex;
},
set: function(e) {
if (this._selectedIndex != e) {
if (e > this._pageIds.length - 1) throw "index out of bounds: " + e;
this.changing = !0;
this._previousIndex = this._selectedIndex;
this._selectedIndex = e;
this.parent.applyController(this);
this.emit(t.Event.STATUS_CHANGED, this);
this.changing = !1;
}
},
enumerable: !0,
configurable: !0
});
i.prototype.onChanged = function(e, i) {
this.on(t.Event.STATUS_CHANGED, e, i);
};
i.prototype.offChanged = function(e, i) {
this.off(t.Event.STATUS_CHANGED, e, i);
};
i.prototype.setSelectedIndex = function(t) {
if (this._selectedIndex != t) {
if (t > this._pageIds.length - 1) throw "index out of bounds: " + t;
this.changing = !0;
this._previousIndex = this._selectedIndex;
this._selectedIndex = t;
this.parent.applyController(this);
this.changing = !1;
}
};
Object.defineProperty(i.prototype, "previsousIndex", {
get: function() {
return this._previousIndex;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selectedPage", {
get: function() {
return -1 == this._selectedIndex ? null : this._pageNames[this._selectedIndex];
},
set: function(t) {
var e = this._pageNames.indexOf(t);
-1 == e && (e = 0);
this.selectedIndex = e;
},
enumerable: !0,
configurable: !0
});
i.prototype.setSelectedPage = function(t) {
var e = this._pageNames.indexOf(t);
-1 == e && (e = 0);
this.setSelectedIndex(e);
};
Object.defineProperty(i.prototype, "previousPage", {
get: function() {
return -1 == this._previousIndex ? null : this._pageNames[this._previousIndex];
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "pageCount", {
get: function() {
return this._pageIds.length;
},
enumerable: !0,
configurable: !0
});
i.prototype.getPageName = function(t) {
return this._pageNames[t];
};
i.prototype.addPage = function(t) {
void 0 === t && (t = "");
this.addPageAt(t, this._pageIds.length);
};
i.prototype.addPageAt = function(t, e) {
var n = "" + i._nextPageId++;
if (e == this._pageIds.length) {
this._pageIds.push(n);
this._pageNames.push(t);
} else {
this._pageIds.splice(e, 0, n);
this._pageNames.splice(e, 0, t);
}
};
i.prototype.removePage = function(t) {
var e = this._pageNames.indexOf(t);
if (-1 != e) {
this._pageIds.splice(e, 1);
this._pageNames.splice(e, 1);
this._selectedIndex >= this._pageIds.length ? this.selectedIndex = this._selectedIndex - 1 : this.parent.applyController(this);
}
};
i.prototype.removePageAt = function(t) {
this._pageIds.splice(t, 1);
this._pageNames.splice(t, 1);
this._selectedIndex >= this._pageIds.length ? this.selectedIndex = this._selectedIndex - 1 : this.parent.applyController(this);
};
i.prototype.clearPages = function() {
this._pageIds.length = 0;
this._pageNames.length = 0;
-1 != this._selectedIndex ? this.selectedIndex = -1 : this.parent.applyController(this);
};
i.prototype.hasPage = function(t) {
return -1 != this._pageNames.indexOf(t);
};
i.prototype.getPageIndexById = function(t) {
return this._pageIds.indexOf(t);
};
i.prototype.getPageIdByName = function(t) {
var e = this._pageNames.indexOf(t);
return -1 != e ? this._pageIds[e] : null;
};
i.prototype.getPageNameById = function(t) {
var e = this._pageIds.indexOf(t);
return -1 != e ? this._pageNames[e] : null;
};
i.prototype.getPageId = function(t) {
return this._pageIds[t];
};
Object.defineProperty(i.prototype, "selectedPageId", {
get: function() {
return -1 == this._selectedIndex ? null : this._pageIds[this._selectedIndex];
},
set: function(t) {
var e = this._pageIds.indexOf(t);
this.selectedIndex = e;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "oppositePageId", {
set: function(t) {
this._pageIds.indexOf(t) > 0 ? this.selectedIndex = 0 : this._pageIds.length > 1 && (this.selectedIndex = 1);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "previousPageId", {
get: function() {
return -1 == this._previousIndex ? null : this._pageIds[this._previousIndex];
},
enumerable: !0,
configurable: !0
});
i.prototype.runActions = function() {
if (this._actions) for (var t = this._actions.length, e = 0; e < t; e++) this._actions[e].run(this, this.previousPageId, this.selectedPageId);
};
i.prototype.setup = function(e) {
var i, n, o = e.position;
e.seek(o, 0);
this.name = e.readS();
this.autoRadioGroupDepth = e.readBool();
e.seek(o, 1);
var r = e.readShort();
for (i = 0; i < r; i++) {
this._pageIds.push(e.readS());
this._pageNames.push(e.readS());
}
e.seek(o, 2);
if ((r = e.readShort()) > 0) {
null == this._actions && (this._actions = new Array());
for (i = 0; i < r; i++) {
n = e.readShort();
n += e.position;
var s = t.ControllerAction.createAction(e.readByte());
s.setup(e);
this._actions.push(s);
e.position = n;
}
}
null != this.parent && this._pageIds.length > 0 ? this._selectedIndex = 0 : this._selectedIndex = -1;
};
i._nextPageId = 0;
return i;
}(cc.EventTarget);
t.Controller = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {
this._agent = new t.GLoader();
this._agent.draggable = !0;
this._agent.touchable = !1;
this._agent.setSize(100, 100);
this._agent.setPivot(.5, .5, !0);
this._agent.align = t.AlignType.Center;
this._agent.verticalAlign = t.VertAlignType.Middle;
this._agent.sortingOrder = 1e6;
this._agent.on(t.Event.DRAG_END, this.onDragEnd, this);
}
Object.defineProperty(e, "inst", {
get: function() {
null == e._inst && (e._inst = new e());
return e._inst;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "dragAgent", {
get: function() {
return this._agent;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "dragging", {
get: function() {
return null != this._agent.parent;
},
enumerable: !0,
configurable: !0
});
e.prototype.startDrag = function(e, i, n, o) {
if (null == this._agent.parent) {
this._sourceData = n;
this._agent.url = i;
t.GRoot.inst.addChild(this._agent);
var r = t.GRoot.inst.getTouchPosition(o);
r = t.GRoot.inst.globalToLocal(r.x, r.y);
this._agent.setPosition(r.x, r.y);
this._agent.startDrag(o);
}
};
e.prototype.cancel = function() {
if (null != this._agent.parent) {
this._agent.stopDrag();
t.GRoot.inst.removeChild(this._agent);
this._sourceData = null;
}
};
e.prototype.onDragEnd = function() {
if (null != this._agent.parent) {
t.GRoot.inst.removeChild(this._agent);
var e = this._sourceData;
this._sourceData = null;
for (var i = t.GRoot.inst.touchTarget; null != i; ) {
if (i.node.hasEventListener(t.Event.DROP)) {
i.requestFocus();
i.node.emit(t.Event.DROP, i, e);
return;
}
i = i.parent;
}
}
};
return e;
}();
t.DragDropManager = e;
})(fgui || (fgui = {}));

(function(t) {
(function(t) {
t[t.Common = 0] = "Common";
t[t.Check = 1] = "Check";
t[t.Radio = 2] = "Radio";
})(t.ButtonMode || (t.ButtonMode = {}));
(function(t) {
t[t.None = 0] = "None";
t[t.Both = 1] = "Both";
t[t.Height = 2] = "Height";
t[t.Shrink = 3] = "Shrink";
})(t.AutoSizeType || (t.AutoSizeType = {}));
(function(t) {
t[t.Left = 0] = "Left";
t[t.Center = 1] = "Center";
t[t.Right = 2] = "Right";
})(t.AlignType || (t.AlignType = {}));
(function(t) {
t[t.Top = 0] = "Top";
t[t.Middle = 1] = "Middle";
t[t.Bottom = 2] = "Bottom";
})(t.VertAlignType || (t.VertAlignType = {}));
(function(t) {
t[t.None = 0] = "None";
t[t.Scale = 1] = "Scale";
t[t.ScaleMatchHeight = 2] = "ScaleMatchHeight";
t[t.ScaleMatchWidth = 3] = "ScaleMatchWidth";
t[t.ScaleFree = 4] = "ScaleFree";
t[t.ScaleNoBorder = 5] = "ScaleNoBorder";
})(t.LoaderFillType || (t.LoaderFillType = {}));
(function(t) {
t[t.SingleColumn = 0] = "SingleColumn";
t[t.SingleRow = 1] = "SingleRow";
t[t.FlowHorizontal = 2] = "FlowHorizontal";
t[t.FlowVertical = 3] = "FlowVertical";
t[t.Pagination = 4] = "Pagination";
})(t.ListLayoutType || (t.ListLayoutType = {}));
(function(t) {
t[t.Single = 0] = "Single";
t[t.Multiple = 1] = "Multiple";
t[t.Multiple_SingleClick = 2] = "Multiple_SingleClick";
t[t.None = 3] = "None";
})(t.ListSelectionMode || (t.ListSelectionMode = {}));
(function(t) {
t[t.Visible = 0] = "Visible";
t[t.Hidden = 1] = "Hidden";
t[t.Scroll = 2] = "Scroll";
})(t.OverflowType || (t.OverflowType = {}));
(function(t) {
t[t.Image = 0] = "Image";
t[t.MovieClip = 1] = "MovieClip";
t[t.Sound = 2] = "Sound";
t[t.Component = 3] = "Component";
t[t.Atlas = 4] = "Atlas";
t[t.Font = 5] = "Font";
t[t.Swf = 6] = "Swf";
t[t.Misc = 7] = "Misc";
t[t.Unknown = 8] = "Unknown";
})(t.PackageItemType || (t.PackageItemType = {}));
(function(t) {
t[t.Image = 0] = "Image";
t[t.MovieClip = 1] = "MovieClip";
t[t.Swf = 2] = "Swf";
t[t.Graph = 3] = "Graph";
t[t.Loader = 4] = "Loader";
t[t.Group = 5] = "Group";
t[t.Text = 6] = "Text";
t[t.RichText = 7] = "RichText";
t[t.InputText = 8] = "InputText";
t[t.Component = 9] = "Component";
t[t.List = 10] = "List";
t[t.Label = 11] = "Label";
t[t.Button = 12] = "Button";
t[t.ComboBox = 13] = "ComboBox";
t[t.ProgressBar = 14] = "ProgressBar";
t[t.Slider = 15] = "Slider";
t[t.ScrollBar = 16] = "ScrollBar";
})(t.ObjectType || (t.ObjectType = {}));
(function(t) {
t[t.Percent = 0] = "Percent";
t[t.ValueAndMax = 1] = "ValueAndMax";
t[t.Value = 2] = "Value";
t[t.Max = 3] = "Max";
})(t.ProgressTitleType || (t.ProgressTitleType = {}));
(function(t) {
t[t.Default = 0] = "Default";
t[t.Visible = 1] = "Visible";
t[t.Auto = 2] = "Auto";
t[t.Hidden = 3] = "Hidden";
})(t.ScrollBarDisplayType || (t.ScrollBarDisplayType = {}));
(function(t) {
t[t.Horizontal = 0] = "Horizontal";
t[t.Vertical = 1] = "Vertical";
t[t.Both = 2] = "Both";
})(t.ScrollType || (t.ScrollType = {}));
(function(t) {
t[t.None = 0] = "None";
t[t.Horizontal = 1] = "Horizontal";
t[t.Vertical = 2] = "Vertical";
t[t.Both = 3] = "Both";
})(t.FlipType || (t.FlipType = {}));
(function(t) {
t[t.Ascent = 0] = "Ascent";
t[t.Descent = 1] = "Descent";
t[t.Arch = 2] = "Arch";
})(t.ChildrenRenderOrder || (t.ChildrenRenderOrder = {}));
(function(t) {
t[t.None = 0] = "None";
t[t.Horizontal = 1] = "Horizontal";
t[t.Vertical = 2] = "Vertical";
})(t.GroupLayoutType || (t.GroupLayoutType = {}));
(function(t) {
t[t.Auto = 0] = "Auto";
t[t.Up = 1] = "Up";
t[t.Down = 2] = "Down";
})(t.PopupDirection || (t.PopupDirection = {}));
(function(t) {
t[t.Left_Left = 0] = "Left_Left";
t[t.Left_Center = 1] = "Left_Center";
t[t.Left_Right = 2] = "Left_Right";
t[t.Center_Center = 3] = "Center_Center";
t[t.Right_Left = 4] = "Right_Left";
t[t.Right_Center = 5] = "Right_Center";
t[t.Right_Right = 6] = "Right_Right";
t[t.Top_Top = 7] = "Top_Top";
t[t.Top_Middle = 8] = "Top_Middle";
t[t.Top_Bottom = 9] = "Top_Bottom";
t[t.Middle_Middle = 10] = "Middle_Middle";
t[t.Bottom_Top = 11] = "Bottom_Top";
t[t.Bottom_Middle = 12] = "Bottom_Middle";
t[t.Bottom_Bottom = 13] = "Bottom_Bottom";
t[t.Width = 14] = "Width";
t[t.Height = 15] = "Height";
t[t.LeftExt_Left = 16] = "LeftExt_Left";
t[t.LeftExt_Right = 17] = "LeftExt_Right";
t[t.RightExt_Left = 18] = "RightExt_Left";
t[t.RightExt_Right = 19] = "RightExt_Right";
t[t.TopExt_Top = 20] = "TopExt_Top";
t[t.TopExt_Bottom = 21] = "TopExt_Bottom";
t[t.BottomExt_Top = 22] = "BottomExt_Top";
t[t.BottomExt_Bottom = 23] = "BottomExt_Bottom";
t[t.Size = 24] = "Size";
})(t.RelationType || (t.RelationType = {}));
(function(t) {
t[t.PlaceHolder = 0] = "PlaceHolder";
t[t.Rect = 1] = "Rect";
t[t.Ellipse = 2] = "Ellipse";
})(t.GraphType || (t.GraphType = {}));
(function(t) {
t[t.None = 0] = "None";
t[t.Horizontal = 1] = "Horizontal";
t[t.Vertical = 2] = "Vertical";
t[t.Radial90 = 3] = "Radial90";
t[t.Radial180 = 4] = "Radial180";
t[t.Radial360 = 5] = "Radial360";
})(t.FillMethod || (t.FillMethod = {}));
(function(t) {
t[t.Top = 0] = "Top";
t[t.Bottom = 1] = "Bottom";
t[t.Left = 2] = "Left";
t[t.Right = 3] = "Right";
})(t.FillOrigin || (t.FillOrigin = {}));
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {
this._x = 0;
this._y = 0;
this._alpha = 1;
this._visible = !0;
this._touchable = !0;
this._grayed = !1;
this._draggable = !1;
this._skewX = 0;
this._skewY = 0;
this._pivotAsAnchor = !1;
this._sortingOrder = 0;
this._internalVisible = !0;
this._handlingController = !1;
this._pixelSnapping = !1;
this._dragTesting = !1;
this.sourceWidth = 0;
this.sourceHeight = 0;
this.initWidth = 0;
this.initHeight = 0;
this.minWidth = 0;
this.minHeight = 0;
this.maxWidth = 0;
this.maxHeight = 0;
this._width = 0;
this._height = 0;
this._rawWidth = 0;
this._rawHeight = 0;
this._sizePercentInGroup = 0;
this._touchDisabled = !1;
this._node = new cc.Node();
if (-1 == e._defaultGroupIndex) {
e._defaultGroupIndex = 0;
for (var n = cc.game.groupList, o = n.length, r = 0; r < o; r++) if (n[r].toLowerCase() == t.UIConfig.defaultUIGroup.toLowerCase()) {
e._defaultGroupIndex = r;
break;
}
}
this._node.$gobj = this;
this._node.groupIndex = e._defaultGroupIndex;
this._node.setAnchorPoint(0, 1);
this._node.on(cc.Node.EventType.ANCHOR_CHANGED, this.handleAnchorChanged, this);
this._id = this._node.uuid;
this._name = "";
this._relations = new t.Relations(this);
this._gears = [];
this._blendMode = t.BlendMode.Normal;
this._partner = this._node.addComponent(i);
}
Object.defineProperty(e.prototype, "id", {
get: function() {
return this._id;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "name", {
get: function() {
return this._name;
},
set: function(t) {
this._name = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "x", {
get: function() {
return this._x;
},
set: function(t) {
this.setPosition(t, this._y);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "y", {
get: function() {
return this._y;
},
set: function(t) {
this.setPosition(this._x, t);
},
enumerable: !0,
configurable: !0
});
e.prototype.setPosition = function(i, n) {
if (this._x != i || this._y != n) {
var o = i - this._x, r = n - this._y;
this._x = i;
this._y = n;
this.handlePositionChanged();
this instanceof t.GGroup && this.moveChildren(o, r);
this.updateGear(1);
if (this._parent && !(this._parent instanceof t.GList)) {
this._parent.setBoundsChangedFlag();
null != this._group && this._group.setBoundsChangedFlag();
this._node.emit(t.Event.XY_CHANGED, this);
}
e.draggingObject != this || e.sUpdateInDragging || this.localToGlobalRect(0, 0, this._width, this._height, e.sGlobalRect);
}
};
Object.defineProperty(e.prototype, "xMin", {
get: function() {
return this._pivotAsAnchor ? this._x - this._width * this.node.anchorX : this._x;
},
set: function(t) {
this._pivotAsAnchor ? this.setPosition(t + this._width * this.node.anchorX, this._y) : this.setPosition(t, this._y);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "yMin", {
get: function() {
return this._pivotAsAnchor ? this._y - this._height * (1 - this.node.anchorY) : this._y;
},
set: function(t) {
this._pivotAsAnchor ? this.setPosition(this._x, t + this._height * (1 - this.node.anchorY)) : this.setPosition(this._x, t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "pixelSnapping", {
get: function() {
return this._pixelSnapping;
},
set: function(t) {
if (this._pixelSnapping != t) {
this._pixelSnapping = t;
this.handlePositionChanged();
}
},
enumerable: !0,
configurable: !0
});
e.prototype.center = function(e) {
var i;
i = null != this._parent ? this.parent : this.root;
this.setPosition((i.width - this._width) / 2, (i.height - this._height) / 2);
if (e) {
this.addRelation(i, t.RelationType.Center_Center);
this.addRelation(i, t.RelationType.Middle_Middle);
}
};
Object.defineProperty(e.prototype, "width", {
get: function() {
this.ensureSizeCorrect();
this._relations.sizeDirty && this._relations.ensureRelationsSizeCorrect();
return this._width;
},
set: function(t) {
this.setSize(t, this._rawHeight);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "height", {
get: function() {
this.ensureSizeCorrect();
this._relations.sizeDirty && this._relations.ensureRelationsSizeCorrect();
return this._height;
},
set: function(t) {
this.setSize(this._rawWidth, t);
},
enumerable: !0,
configurable: !0
});
e.prototype.setSize = function(e, i, n) {
if (this._rawWidth != e || this._rawHeight != i) {
this._rawWidth = e;
this._rawHeight = i;
e < this.minWidth && (e = this.minWidth);
i < this.minHeight && (i = this.minHeight);
this.maxWidth > 0 && e > this.maxWidth && (e = this.maxWidth);
this.maxHeight > 0 && i > this.maxHeight && (i = this.maxHeight);
var o = e - this._width, r = i - this._height;
this._width = e;
this._height = i;
this.handleSizeChanged();
0 == this.node.anchorX && 1 == this.node.anchorY || this._pivotAsAnchor || n ? this.handlePositionChanged() : this.setPosition(this.x - this.node.anchorX * o, this.y - (1 - this.node.anchorY) * r);
this instanceof t.GGroup && this.resizeChildren(o, r);
this.updateGear(2);
if (this._parent) {
this._relations.onOwnerSizeChanged(o, r, this._pivotAsAnchor || !n);
this._parent.setBoundsChangedFlag();
null != this._group && this._group.setBoundsChangedFlag(!0);
}
this._node.emit(t.Event.SIZE_CHANGED, this);
}
};
e.prototype.makeFullScreen = function() {
this.setSize(t.GRoot.inst.width, t.GRoot.inst.height);
};
e.prototype.ensureSizeCorrect = function() {};
Object.defineProperty(e.prototype, "actualWidth", {
get: function() {
return this.width * Math.abs(this._node.scaleX);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "actualHeight", {
get: function() {
return this.height * Math.abs(this._node.scaleY);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "scaleX", {
get: function() {
return this._node.scaleX;
},
set: function(t) {
this.setScale(t, this._node.scaleY);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "scaleY", {
get: function() {
return this._node.scaleY;
},
set: function(t) {
this.setScale(this._node.scaleX, t);
},
enumerable: !0,
configurable: !0
});
e.prototype.setScale = function(t, e) {
if (this._node.scaleX != t || this._node.scaleY != e) {
this._node.setScale(t, e);
this.updateGear(2);
}
};
Object.defineProperty(e.prototype, "skewX", {
get: function() {
return this._skewX;
},
set: function(t) {
this.setSkew(t, this._skewY);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "skewY", {
get: function() {
return this._skewY;
},
set: function(t) {
this.setSkew(this._skewX, t);
},
enumerable: !0,
configurable: !0
});
e.prototype.setSkew = function(t, e) {
if (this._skewX != t || this._skewY != e) {
this._skewX = t;
this._skewY = e;
this._node.skewX = t;
this._node.skewY = e;
}
};
Object.defineProperty(e.prototype, "pivotX", {
get: function() {
return this.node.anchorX;
},
set: function(t) {
this.node.anchorX = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "pivotY", {
get: function() {
return 1 - this.node.anchorY;
},
set: function(t) {
this.node.anchorY = 1 - t;
},
enumerable: !0,
configurable: !0
});
e.prototype.setPivot = function(t, e, i) {
if (this.node.anchorX != t || this.node.anchorY != 1 - e) {
this._pivotAsAnchor = i;
this.node.setAnchorPoint(t, 1 - e);
} else if (this._pivotAsAnchor != i) {
this._pivotAsAnchor = i;
this.handlePositionChanged();
}
};
Object.defineProperty(e.prototype, "pivotAsAnchor", {
get: function() {
return this._pivotAsAnchor;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "touchable", {
get: function() {
return this._touchable;
},
set: function(t) {
if (this._touchable != t) {
this._touchable = t;
this.updateGear(3);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "grayed", {
get: function() {
return this._grayed;
},
set: function(t) {
if (this._grayed != t) {
this._grayed = t;
this.handleGrayedChanged();
this.updateGear(3);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "enabled", {
get: function() {
return !this._grayed && this._touchable;
},
set: function(t) {
this.grayed = !t;
this.touchable = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "rotation", {
get: function() {
var t = this._node.angle;
return void 0 != t ? -t : this._node.rotation;
},
set: function(t) {
var e = this._node.angle;
if (void 0 != e) {
if (e != (t = -t)) {
this._node.angle = t;
this.updateGear(3);
}
} else if (this._node.rotation != t) {
this._node.rotation = t;
this.updateGear(3);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "alpha", {
get: function() {
return this._alpha;
},
set: function(e) {
if (this._alpha != e) {
this._alpha = e;
this._node.opacity = 255 * this._alpha;
this instanceof t.GGroup && this.setChildrenAlpha();
this.updateGear(3);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "visible", {
get: function() {
return this._visible;
},
set: function(t) {
if (this._visible != t) {
this._visible = t;
this.handleVisibleChanged();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "_finalVisible", {
get: function() {
return this._visible && this._internalVisible && (!this._group || this._group._finalVisible);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "sortingOrder", {
get: function() {
return this._sortingOrder;
},
set: function(t) {
t < 0 && (t = 0);
if (this._sortingOrder != t) {
var e = this._sortingOrder;
this._sortingOrder = t;
null != this._parent && this._parent.childSortingOrderChanged(this, e, this._sortingOrder);
}
},
enumerable: !0,
configurable: !0
});
e.prototype.requestFocus = function() {};
Object.defineProperty(e.prototype, "tooltips", {
get: function() {
return this._tooltips;
},
set: function(e) {
if (this._tooltips) {
this._node.off(t.Event.ROLL_OVER, this.onRollOver, this);
this._node.off(t.Event.ROLL_OUT, this.onRollOut, this);
}
this._tooltips = e;
if (this._tooltips) {
this._node.on(t.Event.ROLL_OVER, this.onRollOver, this);
this._node.on(t.Event.ROLL_OUT, this.onRollOut, this);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "blendMode", {
get: function() {
return this._blendMode;
},
set: function(e) {
if (this._blendMode != e) {
this._blendMode = e;
t.BlendModeUtils.apply(this._node, e);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "onStage", {
get: function() {
return this._node.activeInHierarchy;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "resourceURL", {
get: function() {
return null != this.packageItem ? "ui://" + this.packageItem.owner.id + this.packageItem.id : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "group", {
get: function() {
return this._group;
},
set: function(t) {
if (this._group != t) {
null != this._group && this._group.setBoundsChangedFlag(!0);
this._group = t;
null != this._group && this._group.setBoundsChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
e.prototype.getGear = function(e) {
var i = this._gears[e];
if (null == i) {
switch (e) {
case 0:
i = new t.GearDisplay(this);
break;

case 1:
i = new t.GearXY(this);
break;

case 2:
i = new t.GearSize(this);
break;

case 3:
i = new t.GearLook(this);
break;

case 4:
i = new t.GearColor(this);
break;

case 5:
i = new t.GearAnimation(this);
break;

case 6:
i = new t.GearText(this);
break;

case 7:
i = new t.GearIcon(this);
break;

default:
throw "FairyGUI: invalid gear index!";
}
this._gears[e] = i;
}
return i;
};
e.prototype.updateGear = function(t) {
if (!this._underConstruct && !this._gearLocked) {
var e = this._gears[t];
null != e && null != e.controller && e.updateState();
}
};
e.prototype.checkGearController = function(t, e) {
return null != this._gears[t] && this._gears[t].controller == e;
};
e.prototype.updateGearFromRelations = function(t, e, i) {
null != this._gears[t] && this._gears[t].updateFromRelations(e, i);
};
e.prototype.addDisplayLock = function() {
var t = this._gears[0];
if (t && t.controller) {
var e = t.addLock();
this.checkGearDisplay();
return e;
}
return 0;
};
e.prototype.releaseDisplayLock = function(t) {
var e = this._gears[0];
if (e && e.controller) {
e.releaseLock(t);
this.checkGearDisplay();
}
};
e.prototype.checkGearDisplay = function() {
if (!this._handlingController) {
var t = null == this._gears[0] || this._gears[0].connected;
if (t != this._internalVisible) {
this._internalVisible = t;
this.handleVisibleChanged();
}
}
};
Object.defineProperty(e.prototype, "gearXY", {
get: function() {
return this.getGear(1);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "gearSize", {
get: function() {
return this.getGear(2);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "gearLook", {
get: function() {
return this.getGear(3);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "relations", {
get: function() {
return this._relations;
},
enumerable: !0,
configurable: !0
});
e.prototype.addRelation = function(t, e, i) {
this._relations.add(t, e, i);
};
e.prototype.removeRelation = function(t, e) {
this._relations.remove(t, e);
};
Object.defineProperty(e.prototype, "node", {
get: function() {
return this._node;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "parent", {
get: function() {
return this._parent;
},
enumerable: !0,
configurable: !0
});
e.prototype.removeFromParent = function() {
this._parent && this._parent.removeChild(this);
};
e.prototype.findParent = function() {
if (this._parent) return this._parent;
for (var t = this._node.parent; t; ) {
var e = t.$gobj;
if (e) return e;
t = t.parent;
}
return null;
};
Object.defineProperty(e.prototype, "root", {
get: function() {
if (this instanceof t.GRoot) return this;
for (var e = this._parent; e; ) {
if (e instanceof t.GRoot) return e;
e = e.parent;
}
return t.GRoot.inst;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asCom", {
get: function() {
return this instanceof t.GComponent ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asButton", {
get: function() {
return this instanceof t.GButton ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asLabel", {
get: function() {
return this instanceof t.GLabel ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asProgress", {
get: function() {
return this instanceof t.GProgressBar ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asTextField", {
get: function() {
return this instanceof t.GTextField ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asRichTextField", {
get: function() {
return this instanceof t.GRichTextField ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asTextInput", {
get: function() {
return this instanceof t.GTextInput ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asLoader", {
get: function() {
return this instanceof t.GLoader ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asList", {
get: function() {
return this instanceof t.GList ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asGraph", {
get: function() {
return this instanceof t.GGraph ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asGroup", {
get: function() {
return this instanceof t.GGroup ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asSlider", {
get: function() {
return this instanceof t.GSlider ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asComboBox", {
get: function() {
return this instanceof t.GComboBox ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asImage", {
get: function() {
return this instanceof t.GImage ? this : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "asMovieClip", {
get: function() {
return this instanceof t.GMovieClip ? this : null;
},
enumerable: !0,
configurable: !0
});
e.cast = function(t) {
return t.$gobj;
};
Object.defineProperty(e.prototype, "text", {
get: function() {
return null;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "icon", {
get: function() {
return null;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
e.prototype.dispose = function() {
var t = this._node;
if (t) {
this.removeFromParent();
this._relations.dispose();
this._node = null;
t.destroy();
}
};
e.prototype.onEnable = function() {};
e.prototype.onDisable = function() {};
e.prototype.onUpdate = function() {};
e.prototype.onDestroy = function() {};
e.prototype.onClick = function(e, i) {
this._node.on(t.Event.CLICK, e, i);
};
e.prototype.offClick = function(e, i) {
this._node.off(t.Event.CLICK, e, i);
};
e.prototype.hasClickListener = function() {
return this._node.hasEventListener(t.Event.CLICK);
};
e.prototype.on = function(e, i, n) {
e != t.Event.DISPLAY && e != t.Event.UNDISPLAY || (this._partner._emitDisplayEvents = !0);
this._node.on(e, i, n);
};
e.prototype.off = function(t, e, i) {
this._node.off(t, e, i);
};
Object.defineProperty(e.prototype, "draggable", {
get: function() {
return this._draggable;
},
set: function(t) {
if (this._draggable != t) {
this._draggable = t;
this.initDrag();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "dragBounds", {
get: function() {
return this._dragBounds;
},
set: function(t) {
this._dragBounds = t;
},
enumerable: !0,
configurable: !0
});
e.prototype.startDrag = function(t) {
this._node.activeInHierarchy && this.dragBegin(t);
};
e.prototype.stopDrag = function() {
this.dragEnd();
};
Object.defineProperty(e.prototype, "dragging", {
get: function() {
return e.draggingObject == this;
},
enumerable: !0,
configurable: !0
});
e.prototype.localToGlobal = function(e, i, n) {
void 0 == e && (e = 0);
void 0 == i && (i = 0);
var o = n || new cc.Vec2();
o.x = e;
o.y = i;
o.y = -o.y;
if (!this._pivotAsAnchor) {
o.x -= this.node.anchorX * this._width;
o.y += (1 - this.node.anchorY) * this._height;
}
o.set(this._node.convertToWorldSpaceAR(o));
o.y = t.GRoot.inst.height - o.y;
return o;
};
e.prototype.globalToLocal = function(e, i, n) {
void 0 == e && (e = 0);
void 0 == i && (i = 0);
var o = n || new cc.Vec2();
o.x = e;
o.y = t.GRoot.inst.height - i;
o.set(this._node.convertToNodeSpaceAR(o));
if (!this._pivotAsAnchor) {
o.x -= this.node.anchorX * this._width;
o.y += (1 - this.node.anchorY) * this._height;
}
o.y = -o.y;
return o;
};
e.prototype.localToGlobalRect = function(t, e, i, n, o) {
void 0 == t && (t = 0);
void 0 == e && (e = 0);
void 0 == i && (i = 0);
void 0 == n && (n = 0);
var r = o || new cc.Rect(), s = this.localToGlobal(t, e);
r.x = s.x;
r.y = s.y;
s = this.localToGlobal(t + i, e + n, s);
r.xMax = s.x;
r.yMax = s.y;
return r;
};
e.prototype.globalToLocalRect = function(t, e, i, n, o) {
void 0 == t && (t = 0);
void 0 == e && (e = 0);
void 0 == i && (i = 0);
void 0 == n && (n = 0);
var r = o || new cc.Rect(), s = this.globalToLocal(t, e);
r.x = s.x;
r.y = s.y;
s = this.globalToLocal(t + i, e + n, s);
r.xMax = s.x;
r.yMax = s.y;
return r;
};
e.prototype.handleControllerChanged = function(t) {
this._handlingController = !0;
for (var e = 0; e < 8; e++) {
var i = this._gears[e];
null != i && i.controller == t && i.apply();
}
this._handlingController = !1;
this.checkGearDisplay();
};
e.prototype.handleAnchorChanged = function() {
this.handlePositionChanged();
};
e.prototype.handlePositionChanged = function() {
var t = this._x, e = -this._y;
if (!this._pivotAsAnchor) {
t += this.node.anchorX * this._width;
e -= (1 - this.node.anchorY) * this._height;
}
if (this._pixelSnapping) {
t = Math.round(t);
e = Math.round(e);
}
this._node.setPosition(t, e);
};
e.prototype.handleSizeChanged = function() {
this._node.setContentSize(this._width, this._height);
};
e.prototype.handleGrayedChanged = function() {};
e.prototype.handleVisibleChanged = function() {
this._node.active = this._finalVisible;
this instanceof t.GGroup && this.setChildrenVisible();
this._parent && this._parent.setBoundsChangedFlag();
};
e.prototype.hitTest = function(t) {
if (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy) return null;
var e = this._node.convertToNodeSpace(t);
return e.x >= 0 && e.y >= 0 && e.x < this._width && e.y < this._height ? this : null;
};
e.prototype.constructFromResource = function() {};
e.prototype.setup_beforeAdd = function(t, e) {
t.seek(e, 0);
t.skip(5);
var i, n;
this._id = t.readS();
this._name = t.readS();
i = t.readInt();
n = t.readInt();
this.setPosition(i, n);
if (t.readBool()) {
this.initWidth = t.readInt();
this.initHeight = t.readInt();
this.setSize(this.initWidth, this.initHeight, !0);
}
if (t.readBool()) {
this.minWidth = t.readInt();
this.maxWidth = t.readInt();
this.minHeight = t.readInt();
this.maxHeight = t.readInt();
}
if (t.readBool()) {
i = t.readFloat();
n = t.readFloat();
this.setScale(i, n);
}
if (t.readBool()) {
i = t.readFloat();
n = t.readFloat();
this.setSkew(i, n);
}
if (t.readBool()) {
i = t.readFloat();
n = t.readFloat();
this.setPivot(i, n, t.readBool());
}
1 != (i = t.readFloat()) && (this.alpha = i);
0 != (i = t.readFloat()) && (this.rotation = i);
t.readBool() || (this.visible = !1);
t.readBool() || (this.touchable = !1);
t.readBool() && (this.grayed = !0);
this.blendMode = t.readByte();
t.readByte();
var o = t.readS();
null != o && (this.data = o);
};
e.prototype.setup_afterAdd = function(t, e) {
t.seek(e, 1);
var i = t.readS();
null != i && (this.tooltips = i);
var n = t.readShort();
n >= 0 && (this.group = this.parent.getChildAt(n));
t.seek(e, 2);
for (var o = t.readShort(), r = 0; r < o; r++) {
var s = t.readShort();
s += t.position;
this.getGear(t.readByte()).setup(t);
t.position = s;
}
};
e.prototype.onRollOver = function() {
this.root.showTooltips(this.tooltips);
};
e.prototype.onRollOut = function() {
this.root.hideTooltips();
};
e.prototype.initDrag = function() {
if (this._draggable) {
this.on(t.Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
this.on(t.Event.TOUCH_MOVE, this.onTouchMove_0, this);
this.on(t.Event.TOUCH_END, this.onTouchEnd_0, this);
} else {
this.off(t.Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
this.off(t.Event.TOUCH_MOVE, this.onTouchMove_0, this);
this.off(t.Event.TOUCH_END, this.onTouchEnd_0, this);
}
};
e.prototype.dragBegin = function(i) {
if (null != e.draggingObject) {
var n = e.draggingObject;
n.stopDrag();
e.draggingObject = null;
n._node.emit(t.Event.DRAG_END);
}
void 0 == i && (i = t.GRoot.inst.inputProcessor.getAllTouches()[0]);
e.sGlobalDragStart.set(t.GRoot.inst.getTouchPosition(i));
this.localToGlobalRect(0, 0, this._width, this._height, e.sGlobalRect);
e.draggingObject = this;
this._dragTesting = !0;
t.GRoot.inst.inputProcessor.addTouchMonitor(i, this);
this.on(t.Event.TOUCH_MOVE, this.onTouchMove_0, this);
this.on(t.Event.TOUCH_END, this.onTouchEnd_0, this);
};
e.prototype.dragEnd = function() {
if (e.draggingObject == this) {
this._dragTesting = !1;
e.draggingObject = null;
}
e.sDragQuery = !1;
};
e.prototype.onTouchBegin_0 = function(t) {
null == this._dragStartPoint && (this._dragStartPoint = new cc.Vec2());
this._dragStartPoint.set(t.pos);
this._dragTesting = !0;
t.captureTouch();
};
e.prototype.onTouchMove_0 = function(i) {
if (e.draggingObject != this && this._draggable && this._dragTesting) {
var n = t.UIConfig.touchDragSensitivity;
if (Math.abs(this._dragStartPoint.x - i.pos.x) < n && Math.abs(this._dragStartPoint.y - i.pos.y) < n) return;
this._dragTesting = !1;
e.sDragQuery = !0;
this._node.emit(t.Event.DRAG_START, i);
e.sDragQuery && this.dragBegin(i.touchId);
}
if (e.draggingObject == this) {
var o = i.pos.x - e.sGlobalDragStart.x + e.sGlobalRect.x, r = i.pos.y - e.sGlobalDragStart.y + e.sGlobalRect.y;
if (null != this._dragBounds) {
var s = t.GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y, this._dragBounds.width, this._dragBounds.height, e.sDragHelperRect);
o < s.x ? o = s.x : o + e.sGlobalRect.width > s.xMax && (o = s.xMax - e.sGlobalRect.width) < s.x && (o = s.x);
r < s.y ? r = s.y : r + e.sGlobalRect.height > s.yMax && (r = s.yMax - e.sGlobalRect.height) < s.y && (r = s.y);
}
e.sUpdateInDragging = !0;
var a = this.parent.globalToLocal(o, r, e.sHelperPoint);
this.setPosition(Math.round(a.x), Math.round(a.y));
e.sUpdateInDragging = !1;
this._node.emit(t.Event.DRAG_MOVE, i);
}
};
e.prototype.onTouchEnd_0 = function(i) {
if (e.draggingObject == this) {
e.draggingObject = null;
this._node.emit(t.Event.DRAG_END, i);
}
};
e._defaultGroupIndex = -1;
e.sGlobalDragStart = new cc.Vec2();
e.sGlobalRect = new cc.Rect();
e.sHelperPoint = new cc.Vec2();
e.sDragHelperRect = new cc.Rect();
e.sDragQuery = !1;
return e;
}();
t.GObject = e;
var i = function(e) {
__extends(i, e);
function i() {
var t = null !== e && e.apply(this, arguments) || this;
t._emitDisplayEvents = !1;
return t;
}
i.prototype.callLater = function(t, e) {
cc.director.getScheduler().isScheduled(t, this) || this.scheduleOnce(t, e);
};
i.prototype.onClickLink = function(e, i) {
this.node.emit(t.Event.LINK, i, e);
};
i.prototype.onEnable = function() {
this.node.$gobj.onEnable();
this._emitDisplayEvents && this.node.emit(t.Event.DISPLAY);
};
i.prototype.onDisable = function() {
this.node.$gobj.onDisable();
this._emitDisplayEvents && this.node.emit(t.Event.UNDISPLAY);
};
i.prototype.update = function(t) {
this.node.$gobj.onUpdate(t);
};
i.prototype.onDestroy = function() {
this.node.$gobj.onDestroy();
};
return i;
}(cc.Component);
t.GObjectPartner = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._sortingChildCount = 0;
i._childrenRenderOrder = t.ChildrenRenderOrder.Ascent;
i._apexIndex = 0;
i._node.name = "GComponent";
i._children = new Array();
i._controllers = new Array();
i._transitions = new Array();
i._margin = new t.Margin();
i._alignOffset = new cc.Vec2();
i._container = new cc.Node("Container");
i._container.setAnchorPoint(0, 1);
i._node.addChild(i._container);
return i;
}
i.prototype.dispose = function() {
var t, i;
i = this._transitions.length;
for (t = 0; t < i; ++t) {
this._transitions[t].dispose();
}
i = this._controllers.length;
for (t = 0; t < i; ++t) {
this._controllers[t].dispose();
}
this._scrollPane && this._scrollPane.destroy();
for (t = (i = this._children.length) - 1; t >= 0; --t) {
var n = this._children[t];
n._parent = null;
n.dispose();
}
this._boundsChanged = !1;
e.prototype.dispose.call(this);
};
Object.defineProperty(i.prototype, "displayListContainer", {
get: function() {
return this._container;
},
enumerable: !0,
configurable: !0
});
i.prototype.addChild = function(t) {
this.addChildAt(t, this._children.length);
return t;
};
i.prototype.addChildAt = function(t, e) {
if (!t) throw "child is null";
var i = this._children.length;
if (e >= 0 && e <= i) {
if (t.parent == this) this.setChildIndex(t, e); else {
t.removeFromParent();
t._parent = this;
var n = this._children.length;
if (0 != t.sortingOrder) {
this._sortingChildCount++;
e = this.getInsertPosForSortingChild(t);
} else this._sortingChildCount > 0 && e > n - this._sortingChildCount && (e = n - this._sortingChildCount);
e == n ? this._children.push(t) : this._children.splice(e, 0, t);
this.onChildAdd(t, e);
this.setBoundsChangedFlag();
}
return t;
}
throw "Invalid child index";
};
i.prototype.getInsertPosForSortingChild = function(t) {
var e = this._children.length, i = 0;
for (i = 0; i < e; i++) {
var n = this._children[i];
if (n != t && t.sortingOrder < n.sortingOrder) break;
}
return i;
};
i.prototype.removeChild = function(t, e) {
var i = this._children.indexOf(t);
-1 != i && this.removeChildAt(i, e);
return t;
};
i.prototype.removeChildAt = function(e, i) {
if (e >= 0 && e < this.numChildren) {
var n = this._children[e];
n._parent = null;
0 != n.sortingOrder && this._sortingChildCount--;
this._children.splice(e, 1);
n.group = null;
this._container.removeChild(n.node);
this._childrenRenderOrder == t.ChildrenRenderOrder.Arch && this._partner.callLater(this.buildNativeDisplayList);
i ? n.dispose() : n.node.parent = null;
this.setBoundsChangedFlag();
return n;
}
throw "Invalid child index";
};
i.prototype.removeChildren = function(t, e, i) {
void 0 == t && (t = 0);
void 0 == e && (e = -1);
(e < 0 || e >= this.numChildren) && (e = this.numChildren - 1);
for (var n = t; n <= e; ++n) this.removeChildAt(t, i);
};
i.prototype.getChildAt = function(t) {
if (t >= 0 && t < this.numChildren) return this._children[t];
throw "Invalid child index";
};
i.prototype.getChild = function(t) {
for (var e = this._children.length, i = 0; i < e; ++i) if (this._children[i].name == t) return this._children[i];
return null;
};
i.prototype.getVisibleChild = function(t) {
for (var e = this._children.length, i = 0; i < e; ++i) {
var n = this._children[i];
if (n._finalVisible && n.name == t) return n;
}
return null;
};
i.prototype.getChildInGroup = function(t, e) {
for (var i = this._children.length, n = 0; n < i; ++n) {
var o = this._children[n];
if (o.group == e && o.name == t) return o;
}
return null;
};
i.prototype.getChildById = function(t) {
for (var e = this._children.length, i = 0; i < e; ++i) if (this._children[i]._id == t) return this._children[i];
return null;
};
i.prototype.getChildIndex = function(t) {
return this._children.indexOf(t);
};
i.prototype.setChildIndex = function(t, e) {
var i = this._children.indexOf(t);
if (-1 == i) throw "Not a child of this container";
if (0 == t.sortingOrder) {
var n = this._children.length;
this._sortingChildCount > 0 && e > n - this._sortingChildCount - 1 && (e = n - this._sortingChildCount - 1);
this._setChildIndex(t, i, e);
}
};
i.prototype.setChildIndexBefore = function(t, e) {
var i = this._children.indexOf(t);
if (-1 == i) throw "Not a child of this container";
if (0 != t.sortingOrder) return i;
var n = this._children.length;
this._sortingChildCount > 0 && e > n - this._sortingChildCount - 1 && (e = n - this._sortingChildCount - 1);
return i < e ? this._setChildIndex(t, i, e - 1) : this._setChildIndex(t, i, e);
};
i.prototype._setChildIndex = function(e, i, n) {
var o = this._children.length;
n > o && (n = o);
if (i == n) return i;
this._children.splice(i, 1);
this._children.splice(n, 0, e);
this._childrenRenderOrder == t.ChildrenRenderOrder.Ascent ? e.node.setSiblingIndex(n) : this._childrenRenderOrder == t.ChildrenRenderOrder.Descent ? e.node.setSiblingIndex(o - n) : this._partner.callLater(this.buildNativeDisplayList);
this.setBoundsChangedFlag();
return n;
};
i.prototype.swapChildren = function(t, e) {
var i = this._children.indexOf(t), n = this._children.indexOf(e);
if (-1 == i || -1 == n) throw "Not a child of this container";
this.swapChildrenAt(i, n);
};
i.prototype.swapChildrenAt = function(t, e) {
var i = this._children[t], n = this._children[e];
this.setChildIndex(i, e);
this.setChildIndex(n, t);
};
Object.defineProperty(i.prototype, "numChildren", {
get: function() {
return this._children.length;
},
enumerable: !0,
configurable: !0
});
i.prototype.isAncestorOf = function(t) {
if (null == t) return !1;
for (var e = t.parent; e; ) {
if (e == this) return !0;
e = e.parent;
}
return !1;
};
i.prototype.addController = function(t) {
this._controllers.push(t);
t.parent = this;
this.applyController(t);
};
i.prototype.getControllerAt = function(t) {
return this._controllers[t];
};
i.prototype.getController = function(t) {
for (var e = this._controllers.length, i = 0; i < e; ++i) {
var n = this._controllers[i];
if (n.name == t) return n;
}
return null;
};
i.prototype.removeController = function(t) {
var e = this._controllers.indexOf(t);
if (-1 == e) throw "controller not exists";
t.parent = null;
this._controllers.splice(e, 1);
for (var i = this._children.length, n = 0; n < i; n++) {
this._children[n].handleControllerChanged(t);
}
};
Object.defineProperty(i.prototype, "controllers", {
get: function() {
return this._controllers;
},
enumerable: !0,
configurable: !0
});
i.prototype.onChildAdd = function(e, i) {
e.node.parent = this._container;
e.node.active = e._finalVisible;
if (!this._buildingDisplayList) {
var n = this._children.length;
this._childrenRenderOrder == t.ChildrenRenderOrder.Ascent ? e.node.setSiblingIndex(i) : this._childrenRenderOrder == t.ChildrenRenderOrder.Descent ? e.node.setSiblingIndex(n - i) : this._partner.callLater(this.buildNativeDisplayList);
}
};
i.prototype.buildNativeDisplayList = function(e) {
if (isNaN(e)) {
var i = this._children.length;
if (0 != i) {
switch (this._childrenRenderOrder) {
case t.ChildrenRenderOrder.Ascent:
for (var n = 0, o = 0; o < i; o++) this._children[o].node.setSiblingIndex(n++);
break;

case t.ChildrenRenderOrder.Descent:
for (n = 0, o = i - 1; o >= 0; o--) this._children[o].node.setSiblingIndex(n++);
break;

case t.ChildrenRenderOrder.Arch:
for (n = 0, o = 0; o < this._apexIndex; o++) this._children[o].node.setSiblingIndex(n++);
for (o = i - 1; o >= this._apexIndex; o--) this._children[o].node.setSiblingIndex(n++);
}
}
} else {
this.node.$gobj.buildNativeDisplayList();
}
};
i.prototype.applyController = function(t) {
this._applyingController = t;
for (var e = this._children.length, i = 0; i < e; i++) this._children[i].handleControllerChanged(t);
this._applyingController = null;
t.runActions();
};
i.prototype.applyAllControllers = function() {
for (var t = this._controllers.length, e = 0; e < t; ++e) this.applyController(this._controllers[e]);
};
i.prototype.adjustRadioGroupDepth = function(e, i) {
var n, o, r = this._children.length, s = -1, a = -1;
for (n = 0; n < r; n++) (o = this._children[n]) == e ? s = n : o instanceof t.GButton && o.relatedController == i && n > a && (a = n);
if (s < a) {
null != this._applyingController && this._children[a].handleControllerChanged(this._applyingController);
this.swapChildrenAt(s, a);
}
};
i.prototype.getTransitionAt = function(t) {
return this._transitions[t];
};
i.prototype.getTransition = function(t) {
for (var e = this._transitions.length, i = 0; i < e; ++i) {
var n = this._transitions[i];
if (n.name == t) return n;
}
return null;
};
i.prototype.isChildInView = function(t) {
return null != this._rectMask ? t.x + t.width >= 0 && t.x <= this.width && t.y + t.height >= 0 && t.y <= this.height : null == this._scrollPane || this._scrollPane.isChildInView(t);
};
i.prototype.getFirstChildInView = function() {
for (var t = this._children.length, e = 0; e < t; ++e) {
var i = this._children[e];
if (this.isChildInView(i)) return e;
}
return -1;
};
Object.defineProperty(i.prototype, "scrollPane", {
get: function() {
return this._scrollPane;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "opaque", {
get: function() {
return this._opaque;
},
set: function(t) {
this._opaque = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "margin", {
get: function() {
return this._margin;
},
set: function(t) {
this._margin.copy(t);
this.handleSizeChanged();
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "childrenRenderOrder", {
get: function() {
return this._childrenRenderOrder;
},
set: function(t) {
if (this._childrenRenderOrder != t) {
this._childrenRenderOrder = t;
this.buildNativeDisplayList();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "apexIndex", {
get: function() {
return this._apexIndex;
},
set: function(e) {
if (this._apexIndex != e) {
this._apexIndex = e;
this._childrenRenderOrder == t.ChildrenRenderOrder.Arch && this.buildNativeDisplayList();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "mask", {
get: function() {
return this._maskContent;
},
set: function(t) {
this.setMask(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setMask = function(e, i) {
if (this._maskContent) {
this._maskContent.node.off(cc.Node.EventType.POSITION_CHANGED, this.onMaskContentChanged, this);
this._maskContent.node.off(cc.Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);
this._maskContent.node.off(cc.Node.EventType.SCALE_CHANGED, this.onMaskContentChanged, this);
this._maskContent.node.off(cc.Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);
this._maskContent.visible = !0;
}
this._maskContent = e;
if (this._maskContent) {
if (!(e instanceof t.GImage || e instanceof t.GGraph)) return;
if (!this._customMask) {
var n = new cc.Node("Mask");
n.parent = this._node;
this._scrollPane ? this._container.parent.parent = n : this._container.parent = n;
this._customMask = n.addComponent(cc.Mask);
}
e.visible = !1;
e.node.on(cc.Node.EventType.POSITION_CHANGED, this.onMaskContentChanged, this);
e.node.on(cc.Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);
e.node.on(cc.Node.EventType.SCALE_CHANGED, this.onMaskContentChanged, this);
e.node.on(cc.Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);
this._customMask.inverted = i;
this._node.activeInHierarchy ? this.onMaskReady() : this.on(t.Event.DISPLAY, this.onMaskReady, this);
this.onMaskContentChanged();
this._scrollPane ? this._scrollPane.adjustMaskContainer() : this._container.setPosition(0, 0);
} else if (this._customMask) {
this._scrollPane ? this._container.parent.parent = this._node : this._container.parent = this._node;
this._customMask.node.destroy();
this._customMask = null;
this._scrollPane ? this._scrollPane.adjustMaskContainer() : this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
}
};
i.prototype.onMaskReady = function() {
this.off(t.Event.DISPLAY, this.onMaskReady, this);
if (this._maskContent instanceof t.GImage) {
this._customMask.type = cc.Mask.Type.IMAGE_STENCIL;
this._customMask.spriteFrame = this._maskContent._content.spriteFrame;
} else this._maskContent.type == t.GraphType.Ellipse ? this._customMask.type = cc.Mask.Type.ELLIPSE : this._customMask.type = cc.Mask.Type.RECT;
};
i.prototype.onMaskContentChanged = function() {
var t = this._customMask.node, e = this._maskContent.node, i = e.width * e.scaleX, n = e.height * e.scaleY;
t.setContentSize(i, n);
var o = e.x - e.anchorX * i, r = e.y - e.anchorY * n;
t.setAnchorPoint(-o / t.width, -r / t.height);
t.setPosition(this._pivotCorrectX, this._pivotCorrectY);
};
Object.defineProperty(i.prototype, "_pivotCorrectX", {
get: function() {
return -this.pivotX * this._width + this._margin.left;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "_pivotCorrectY", {
get: function() {
return this.pivotY * this._height - this._margin.top;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "baseUserData", {
get: function() {
var t = this.packageItem.rawData;
t.seek(0, 4);
return t.readS();
},
enumerable: !0,
configurable: !0
});
i.prototype.setupScroll = function(e) {
this._scrollPane = this._node.addComponent(t.ScrollPane);
this._scrollPane.setup(e);
};
i.prototype.setupOverflow = function(e) {
e == t.OverflowType.Hidden && (this._rectMask = this._container.addComponent(cc.Mask));
this._margin.isNone || this.handleSizeChanged();
};
i.prototype.handleAnchorChanged = function() {
e.prototype.handleAnchorChanged.call(this);
this._customMask ? this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY) : this._scrollPane ? this._scrollPane.adjustMaskContainer() : this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
};
i.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
this._customMask ? this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY) : this._scrollPane || this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
this._scrollPane ? this._scrollPane.onOwnerSizeChanged() : this._container.setContentSize(this.viewWidth, this.viewHeight);
};
i.prototype.handleGrayedChanged = function() {
var t = this.getController("grayed");
if (null == t) for (var e = this.grayed, i = this._children.length, n = 0; n < i; ++n) this._children[n].grayed = e; else t.selectedIndex = this.grayed ? 1 : 0;
};
i.prototype.handleControllerChanged = function(t) {
e.prototype.handleControllerChanged.call(this, t);
null != this._scrollPane && this._scrollPane.handleControllerChanged(t);
};
i.prototype.hitTest = function(t) {
if (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy) return null;
var e;
if (this._customMask) {
if ((this._customMask._hitTest(t) || !1) == this._customMask.inverted) return null;
}
var i = 0;
if (this.hitArea || this._rectMask) {
i = (r = this._node.convertToNodeSpace(t)).x >= 0 && r.y >= 0 && r.x < this._width && r.y < this._height ? 1 : 2;
if (this.hitArea && !this.hitArea.hitTest(this, r.x, r.y)) return null;
if (this._rectMask) {
r.x += this._container.x;
r.y += this._container.y;
var n = this._container.getContentSize();
if (r.x < 0 || r.y < 0 || r.x >= n.width || r.y >= n.height) return null;
}
}
if (this._scrollPane) {
if (!(e = this._scrollPane.hitTest(t))) return null;
if (e != this) return e;
}
for (var o = this._children.length - 1; o >= 0; o--) if (e = this._children[o].hitTest(t)) return e;
if (this._opaque) {
if (0 == i) {
var r;
i = (r = this._node.convertToNodeSpace(t)).x >= 0 && r.y >= 0 && r.x < this._width && r.y < this._height ? 1 : 2;
}
return 1 == i ? this : null;
}
return null;
};
i.prototype.setBoundsChangedFlag = function() {
if ((this._scrollPane || this._trackBounds) && !this._boundsChanged) {
this._boundsChanged = !0;
this._partner.callLater(this.refresh);
}
};
i.prototype.refresh = function(t) {
if (isNaN(t)) {
if (this._boundsChanged) {
var e = this._children.length;
if (e > 0) for (var i = 0; i < e; i++) {
this._children[i].ensureSizeCorrect();
}
this.updateBounds();
}
} else {
this.node.$gobj.refresh();
}
};
i.prototype.ensureBoundsCorrect = function() {
var t = this._children.length;
if (t > 0) for (var e = 0; e < t; e++) {
this._children[e].ensureSizeCorrect();
}
this._boundsChanged && this.updateBounds();
};
i.prototype.updateBounds = function() {
var t = 0, e = 0, i = 0, n = 0, o = this._children.length;
if (o > 0) {
t = Number.POSITIVE_INFINITY, e = Number.POSITIVE_INFINITY;
var r = Number.NEGATIVE_INFINITY, s = Number.NEGATIVE_INFINITY, a = 0, h = 0;
for (h = 0; h < o; h++) {
var l = this._children[h];
(a = l.x) < t && (t = a);
(a = l.y) < e && (e = a);
(a = l.x + l.actualWidth) > r && (r = a);
(a = l.y + l.actualHeight) > s && (s = a);
}
i = r - t;
n = s - e;
}
this.setBounds(t, e, i, n);
};
i.prototype.setBounds = function(t, e, i, n) {
void 0 === n && (n = 0);
this._boundsChanged = !1;
this._scrollPane && this._scrollPane.setContentSize(Math.round(t + i), Math.round(e + n));
};
Object.defineProperty(i.prototype, "viewWidth", {
get: function() {
return null != this._scrollPane ? this._scrollPane.viewWidth : this.width - this._margin.left - this._margin.right;
},
set: function(t) {
null != this._scrollPane ? this._scrollPane.viewWidth = t : this.width = t + this._margin.left + this._margin.right;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "viewHeight", {
get: function() {
return null != this._scrollPane ? this._scrollPane.viewHeight : this.height - this._margin.top - this._margin.bottom;
},
set: function(t) {
null != this._scrollPane ? this._scrollPane.viewHeight = t : this.height = t + this._margin.top + this._margin.bottom;
},
enumerable: !0,
configurable: !0
});
i.prototype.getSnappingPosition = function(t, e, i) {
i || (i = new cc.Vec2());
var n = this._children.length;
if (0 == n) {
i.x = 0;
i.y = 0;
return i;
}
this.ensureBoundsCorrect();
var o = null, r = null, s = 0;
if (0 != e) {
for (;s < n; s++) if (e < (o = this._children[s]).y) {
if (0 == s) {
e = 0;
break;
}
e = e < (r = this._children[s - 1]).y + r.actualHeight / 2 ? r.y : o.y;
break;
}
s == n && (e = o.y);
}
if (0 != t) {
s > 0 && s--;
for (;s < n; s++) if (t < (o = this._children[s]).x) {
if (0 == s) {
t = 0;
break;
}
t = t < (r = this._children[s - 1]).x + r.actualWidth / 2 ? r.x : o.x;
break;
}
s == n && (t = o.x);
}
i.x = t;
i.y = e;
return i;
};
i.prototype.childSortingOrderChanged = function(t, e, i) {
void 0 === i && (i = 0);
if (0 == i) {
this._sortingChildCount--;
this.setChildIndex(t, this._children.length);
} else {
0 == e && this._sortingChildCount++;
var n = this._children.indexOf(t), o = this.getInsertPosForSortingChild(t);
n < o ? this._setChildIndex(t, n, o - 1) : this._setChildIndex(t, n, o);
}
};
i.prototype.constructFromResource = function() {
this.constructFromResource2(null, 0);
};
i.prototype.constructFromResource2 = function(e, i) {
if (!this.packageItem.decoded) {
this.packageItem.decoded = !0;
t.TranslationHelper.translateComponent(this.packageItem);
}
var n, o, r, s, a, h, l, c, u = this.packageItem.rawData;
u.seek(0, 0);
this._underConstruct = !0;
this.sourceWidth = u.readInt();
this.sourceHeight = u.readInt();
this.initWidth = this.sourceWidth;
this.initHeight = this.sourceHeight;
this.setSize(this.sourceWidth, this.sourceHeight);
if (u.readBool()) {
this.minWidth = u.readInt();
this.maxWidth = u.readInt();
this.minHeight = u.readInt();
this.maxHeight = u.readInt();
}
if (u.readBool()) {
a = u.readFloat();
h = u.readFloat();
this.setPivot(a, h, u.readBool());
}
if (u.readBool()) {
this._margin.top = u.readInt();
this._margin.bottom = u.readInt();
this._margin.left = u.readInt();
this._margin.right = u.readInt();
}
var _ = u.readByte();
if (_ == t.OverflowType.Scroll) {
var d = u.position;
u.seek(0, 7);
this.setupScroll(u);
u.position = d;
} else this.setupOverflow(_);
u.readBool() && u.skip(8);
this._buildingDisplayList = !0;
u.seek(0, 1);
var p, f = u.readShort();
for (n = 0; n < f; n++) {
s = u.readShort();
s += u.position;
var g = new t.Controller();
this._controllers.push(g);
g.parent = this;
g.setup(u);
u.position = s;
}
u.seek(0, 2);
var y = u.readShort();
for (n = 0; n < y; n++) {
o = u.readShort();
r = u.position;
if (null != e) p = e[i + n]; else {
u.seek(r, 0);
var m = u.readByte(), b = u.readS(), v = u.readS(), w = null;
if (null != b) {
var C;
w = null != (C = null != v ? t.UIPackage.getById(v) : this.packageItem.owner) ? C.getItemById(b) : null;
}
if (null != w) {
(p = t.UIObjectFactory.newObject(w)).packageItem = w;
p.constructFromResource();
} else p = t.UIObjectFactory.newObject2(m);
}
p._underConstruct = !0;
p.setup_beforeAdd(u, r);
p._parent = this;
p.node.parent = this._container;
this._children.push(p);
u.position = r + o;
}
u.seek(0, 3);
this.relations.setup(u, !0);
u.seek(0, 2);
u.skip(2);
for (n = 0; n < y; n++) {
s = u.readShort();
s += u.position;
u.seek(u.position, 3);
this._children[n].relations.setup(u, !1);
u.position = s;
}
u.seek(0, 2);
u.skip(2);
for (n = 0; n < y; n++) {
s = u.readShort();
s += u.position;
(p = this._children[n]).setup_afterAdd(u, u.position);
p._underConstruct = !1;
u.position = s;
}
u.seek(0, 4);
u.skip(2);
this.opaque = u.readBool();
var S = u.readShort();
-1 != S && this.setMask(this.getChildAt(S), u.readBool());
var T = u.readS();
if (null != T && (w = this.packageItem.owner.getItemById(T)) && w.hitTestData) {
l = u.readInt();
c = u.readInt();
this.hitArea = new t.PixelHitTest(w.hitTestData, l, c);
}
u.seek(0, 5);
var x = u.readShort();
for (n = 0; n < x; n++) {
s = u.readShort();
s += u.position;
var I = new t.Transition(this);
I.setup(u);
this._transitions.push(I);
u.position = s;
}
this.applyAllControllers();
this._buildingDisplayList = !1;
this._underConstruct = !1;
this.buildNativeDisplayList();
this.setBoundsChangedFlag();
this.packageItem.objectType != t.ObjectType.Component && this.constructExtension(u);
this.onConstruct();
};
i.prototype.constructExtension = function(t) {};
i.prototype.onConstruct = function() {};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
t.seek(i, 4);
var n = t.readShort();
null != n && null != this._scrollPane && (this._scrollPane.pageController = this._parent.getControllerAt(n));
for (var o = t.readShort(), r = 0; r < o; r++) {
var s = this.getController(t.readS()), a = t.readS();
null != s && (s.selectedPageId = a);
}
};
i.prototype.onEnable = function() {
for (var t = this._transitions.length, e = 0; e < t; ++e) this._transitions[e].onEnable();
};
i.prototype.onDisable = function() {
for (var t = this._transitions.length, e = 0; e < t; ++e) this._transitions[e].onDisable();
};
return i;
}(t.GObject);
t.GComponent = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._node.name = "GButton";
i._mode = t.ButtonMode.Common;
i._title = "";
i._icon = "";
i._sound = t.UIConfig.buttonSound;
i._soundVolumeScale = t.UIConfig.buttonSoundVolumeScale;
i._changeStateOnClick = !0;
i._downEffect = 0;
i._downEffectValue = .8;
return i;
}
Object.defineProperty(i.prototype, "icon", {
get: function() {
return this._icon;
},
set: function(t) {
this._icon = t;
t = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
null != this._iconObject && (this._iconObject.icon = t);
this.updateGear(7);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selectedIcon", {
get: function() {
return this._selectedIcon;
},
set: function(t) {
this._selectedIcon = t;
t = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
null != this._iconObject && (this._iconObject.icon = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "title", {
get: function() {
return this._title;
},
set: function(t) {
this._title = t;
this._titleObject && (this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title);
this.updateGear(6);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "text", {
get: function() {
return this.title;
},
set: function(t) {
this.title = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selectedTitle", {
get: function() {
return this._selectedTitle;
},
set: function(t) {
this._selectedTitle = t;
this._titleObject && (this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleColor", {
get: function() {
var t = this.getTextField();
return null != t ? t.color : cc.Color.BLACK;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.color = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleFontSize", {
get: function() {
var t = this.getTextField();
return null != t ? t.fontSize : 0;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.fontSize = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "sound", {
get: function() {
return this._sound;
},
set: function(t) {
this._sound = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "soundVolumeScale", {
get: function() {
return this._soundVolumeScale;
},
set: function(t) {
this._soundVolumeScale = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selected", {
get: function() {
return this._selected;
},
set: function(e) {
if (this._mode != t.ButtonMode.Common && this._selected != e) {
this._selected = e;
this.setCurrentState();
this._selectedTitle && this._titleObject && (this._titleObject.text = this._selected ? this._selectedTitle : this._title);
if (this._selectedIcon) {
var i = this._selected ? this._selectedIcon : this._icon;
null != this._iconObject && (this._iconObject.icon = i);
}
if (this._relatedController && this._parent && !this._parent._buildingDisplayList) if (this._selected) {
this._relatedController.selectedPageId = this._relatedPageId;
this._relatedController.autoRadioGroupDepth && this._parent.adjustRadioGroupDepth(this, this._relatedController);
} else this._mode == t.ButtonMode.Check && this._relatedController.selectedPageId == this._relatedPageId && (this._relatedController.oppositePageId = this._relatedPageId);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "mode", {
get: function() {
return this._mode;
},
set: function(e) {
if (this._mode != e) {
e == t.ButtonMode.Common && (this.selected = !1);
this._mode = e;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "relatedController", {
get: function() {
return this._relatedController;
},
set: function(t) {
this._relatedController = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "relatedPageId", {
get: function() {
return this._relatedPageId;
},
set: function(t) {
this._relatedPageId = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "changeStateOnClick", {
get: function() {
return this._changeStateOnClick;
},
set: function(t) {
this._changeStateOnClick = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "linkedPopup", {
get: function() {
return this._linkedPopup;
},
set: function(t) {
this._linkedPopup = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.getTextField = function() {
return this._titleObject instanceof t.GTextField ? this._titleObject : this._titleObject instanceof t.GLabel ? this._titleObject.getTextField() : this._titleObject instanceof i ? this._titleObject.getTextField() : null;
};
i.prototype.fireClick = function() {
t.GRoot.inst.inputProcessor.simulateClick(this);
};
i.prototype.setState = function(e) {
this._buttonController && (this._buttonController.selectedPage = e);
if (1 == this._downEffect) {
var n = this.numChildren;
if (e == i.DOWN || e == i.SELECTED_OVER || e == i.SELECTED_DISABLED) {
if (!this._downColor) {
var o = 255 * this._downEffectValue;
this._downColor = new cc.Color(o, o, o, 255);
}
for (var r = 0; r < n; r++) {
void 0 == (s = this.getChildAt(r)).color || s instanceof t.GTextField || (s.color = this._downColor);
}
} else for (r = 0; r < n; r++) {
var s;
void 0 == (s = this.getChildAt(r)).color || s instanceof t.GTextField || (s.color = cc.Color.WHITE);
}
} else if (2 == this._downEffect) if (e == i.DOWN || e == i.SELECTED_OVER || e == i.SELECTED_DISABLED) {
if (!this._downScaled) {
this._downScaled = !0;
this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
}
} else if (this._downScaled) {
this._downScaled = !1;
this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
}
};
i.prototype.setCurrentState = function() {
this.grayed && this._buttonController && this._buttonController.hasPage(i.DISABLED) ? this._selected ? this.setState(i.SELECTED_DISABLED) : this.setState(i.DISABLED) : this._selected ? this.setState(this._over ? i.SELECTED_OVER : i.DOWN) : this.setState(this._over ? i.OVER : i.UP);
};
i.prototype.handleControllerChanged = function(t) {
e.prototype.handleControllerChanged.call(this, t);
this._relatedController == t && (this.selected = this._relatedPageId == t.selectedPageId);
};
i.prototype.handleGrayedChanged = function() {
this._buttonController && this._buttonController.hasPage(i.DISABLED) ? this.grayed ? this._selected && this._buttonController.hasPage(i.SELECTED_DISABLED) ? this.setState(i.SELECTED_DISABLED) : this.setState(i.DISABLED) : this._selected ? this.setState(i.DOWN) : this.setState(i.UP) : e.prototype.handleGrayedChanged.call(this);
};
i.prototype.constructExtension = function(e) {
e.seek(0, 6);
this._mode = e.readByte();
var n = e.readS();
n && (this._sound = n);
this._soundVolumeScale = e.readFloat();
this._downEffect = e.readByte();
this._downEffectValue = e.readFloat();
2 == this._downEffect && this.setPivot(.5, .5, this.pivotAsAnchor);
this._buttonController = this.getController("button");
this._titleObject = this.getChild("title");
this._iconObject = this.getChild("icon");
null != this._titleObject && (this._title = this._titleObject.text);
null != this._iconObject && (this._icon = this._iconObject.icon);
this._mode == t.ButtonMode.Common && this.setState(i.UP);
this._node.on(t.Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
this._node.on(t.Event.TOUCH_END, this.onTouchEnd_1, this);
this._node.on(t.Event.ROLL_OVER, this.onRollOver_1, this);
this._node.on(t.Event.ROLL_OUT, this.onRollOut_1, this);
this._node.on(t.Event.CLICK, this.onClick_1, this);
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
if (t.seek(i, 6) && t.readByte() == this.packageItem.objectType) {
var n, o;
null != (n = t.readS()) && (this.title = n);
null != (n = t.readS()) && (this.selectedTitle = n);
null != (n = t.readS()) && (this.icon = n);
null != (n = t.readS()) && (this.selectedIcon = n);
t.readBool() && (this.titleColor = t.readColor());
0 != (o = t.readInt()) && (this.titleFontSize = o);
(o = t.readShort()) >= 0 && (this._relatedController = this.parent.getControllerAt(o));
this._relatedPageId = t.readS();
null != (n = t.readS()) && (this._sound = n);
t.readBool() && (this._soundVolumeScale = t.readFloat());
this.selected = t.readBool();
}
};
i.prototype.onRollOver_1 = function() {
if (this._buttonController && this._buttonController.hasPage(i.OVER)) {
this._over = !0;
this._down || this.grayed && this._buttonController.hasPage(i.DISABLED) || this.setState(this._selected ? i.SELECTED_OVER : i.OVER);
}
};
i.prototype.onRollOut_1 = function() {
if (this._buttonController && this._buttonController.hasPage(i.OVER)) {
this._over = !1;
this._down || this.grayed && this._buttonController.hasPage(i.DISABLED) || this.setState(this._selected ? i.DOWN : i.UP);
}
};
i.prototype.onTouchBegin_1 = function(e) {
if (e.button == cc.Event.EventMouse.BUTTON_LEFT) {
this._down = !0;
e.captureTouch();
this._mode == t.ButtonMode.Common && (this.grayed && this._buttonController && this._buttonController.hasPage(i.DISABLED) ? this.setState(i.SELECTED_DISABLED) : this.setState(i.DOWN));
null != this._linkedPopup && (this._linkedPopup instanceof t.Window ? this._linkedPopup.toggleStatus() : this.root.togglePopup(this._linkedPopup, this));
}
};
i.prototype.onTouchEnd_1 = function(e) {
if (e.button == cc.Event.EventMouse.BUTTON_LEFT && this._down) {
this._down = !1;
if (null == this._node) return;
this._mode == t.ButtonMode.Common ? this.grayed && this._buttonController && this._buttonController.hasPage(i.DISABLED) ? this.setState(i.DISABLED) : this._over ? this.setState(i.OVER) : this.setState(i.UP) : this._over || null == this._buttonController || this._buttonController.selectedPage != i.OVER && this._buttonController.selectedPage != i.SELECTED_OVER || this.setCurrentState();
}
};
i.prototype.onClick_1 = function() {
if (this._sound) {
var e = t.UIPackage.getItemByURL(this._sound);
if (e) {
var i = e.owner.getItemAsset(e);
i && t.GRoot.inst.playOneShotSound(i, this._soundVolumeScale);
}
}
if (this._mode == t.ButtonMode.Check) {
if (this._changeStateOnClick) {
this.selected = !this._selected;
this._node.emit(t.Event.STATUS_CHANGED, this);
}
} else if (this._mode == t.ButtonMode.Radio) {
if (this._changeStateOnClick && !this._selected) {
this.selected = !0;
this._node.emit(t.Event.STATUS_CHANGED, this);
}
} else this._relatedController && (this._relatedController.selectedPageId = this._relatedPageId);
};
i.UP = "up";
i.DOWN = "down";
i.OVER = "over";
i.SELECTED_OVER = "selectedOver";
i.DISABLED = "disabled";
i.SELECTED_DISABLED = "selectedDisabled";
return i;
}(t.GComponent);
t.GButton = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._visibleItemCount = 0;
i._selectedIndex = 0;
i._popupDirection = t.PopupDirection.Auto;
i._node.name = "GComboBox";
i._visibleItemCount = t.UIConfig.defaultComboBoxVisibleItemCount;
i._itemsUpdated = !0;
i._selectedIndex = -1;
i._items = [];
i._values = [];
return i;
}
Object.defineProperty(i.prototype, "text", {
get: function() {
return this._titleObject ? this._titleObject.text : null;
},
set: function(t) {
this._titleObject && (this._titleObject.text = t);
this.updateGear(6);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "icon", {
get: function() {
return this._iconObject ? this._iconObject.icon : null;
},
set: function(t) {
this._iconObject && (this._iconObject.icon = t);
this.updateGear(7);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleColor", {
get: function() {
var t = this.getTextField();
return null != t ? t.color : cc.Color.BLACK;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.color = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleFontSize", {
get: function() {
var t = this.getTextField();
return null != t ? t.fontSize : 0;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.fontSize = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "visibleItemCount", {
get: function() {
return this._visibleItemCount;
},
set: function(t) {
this._visibleItemCount = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "popupDirection", {
get: function() {
return this._popupDirection;
},
set: function(t) {
this._popupDirection = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "items", {
get: function() {
return this._items;
},
set: function(t) {
t ? this._items = t.concat() : this._items.length = 0;
if (this._items.length > 0) {
this._selectedIndex >= this._items.length ? this._selectedIndex = this._items.length - 1 : -1 == this._selectedIndex && (this._selectedIndex = 0);
this.text = this._items[this._selectedIndex];
null != this._icons && this._selectedIndex < this._icons.length && (this.icon = this._icons[this._selectedIndex]);
} else {
this.text = "";
null != this._icons && (this.icon = null);
this._selectedIndex = -1;
}
this._itemsUpdated = !0;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "icons", {
get: function() {
return this._icons;
},
set: function(t) {
this._icons = t;
null != this._icons && -1 != this._selectedIndex && this._selectedIndex < this._icons.length && (this.icon = this._icons[this._selectedIndex]);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "values", {
get: function() {
return this._values;
},
set: function(t) {
t ? this._values = t.concat() : this._values.length = 0;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selectedIndex", {
get: function() {
return this._selectedIndex;
},
set: function(t) {
if (this._selectedIndex != t) {
this._selectedIndex = t;
if (this.selectedIndex >= 0 && this.selectedIndex < this._items.length) {
this.text = this._items[this._selectedIndex];
null != this._icons && this._selectedIndex < this._icons.length && (this.icon = this._icons[this._selectedIndex]);
} else {
this.text = "";
null != this._icons && (this.icon = null);
}
this.updateSelectionController();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "value", {
get: function() {
return this._values[this._selectedIndex];
},
set: function(t) {
this.selectedIndex = this._values.indexOf(t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "selectionController", {
get: function() {
return this._selectionController;
},
set: function(t) {
this._selectionController = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.getTextField = function() {
return this._titleObject instanceof t.GTextField ? this._titleObject : this._titleObject instanceof t.GLabel ? this._titleObject.getTextField() : this._titleObject instanceof t.GButton ? this._titleObject.getTextField() : null;
};
i.prototype.setState = function(t) {
this._buttonController && (this._buttonController.selectedPage = t);
};
i.prototype.constructExtension = function(e) {
var i;
this._buttonController = this.getController("button");
this._titleObject = this.getChild("title");
this._iconObject = this.getChild("icon");
if (i = e.readS()) {
this.dropdown = t.UIPackage.createObjectFromURL(i);
if (!this.dropdown) {
console.error("下拉框必须为元件");
return;
}
this.dropdown.name = "this.dropdown";
this._list = this.dropdown.getChild("list").asList;
if (null == this._list) {
console.error(this.resourceURL + ": 下拉框的弹出元件里必须包含名为list的列表");
return;
}
this._list.on(t.Event.CLICK_ITEM, this.onClickItem, this);
this._list.addRelation(this.dropdown, t.RelationType.Width);
this._list.removeRelation(this.dropdown, t.RelationType.Height);
this.dropdown.addRelation(this._list, t.RelationType.Height);
this.dropdown.removeRelation(this._list, t.RelationType.Width);
this.dropdown.on(t.Event.UNDISPLAY, this.onPopupClosed, this);
}
this._node.on(t.Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
this._node.on(t.Event.TOUCH_END, this.onTouchEnd_1, this);
this._node.on(t.Event.ROLL_OVER, this.onRollOver_1, this);
this._node.on(t.Event.ROLL_OUT, this.onRollOut_1, this);
};
i.prototype.handleControllerChanged = function(t) {
e.prototype.handleControllerChanged.call(this, t);
this._selectionController == t && (this.selectedIndex = t.selectedIndex);
};
i.prototype.updateSelectionController = function() {
if (null != this._selectionController && !this._selectionController.changing && this._selectedIndex < this._selectionController.pageCount) {
var t = this._selectionController;
this._selectionController = null;
t.selectedIndex = this._selectedIndex;
this._selectionController = t;
}
};
i.prototype.dispose = function() {
if (this.dropdown) {
this.dropdown.dispose();
this.dropdown = null;
}
e.prototype.dispose.call(this);
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
if (t.seek(i, 6) && t.readByte() == this.packageItem.objectType) {
var n, o, r, s, a = t.readShort();
for (n = 0; n < a; n++) {
r = t.readShort();
r += t.position;
this._items[n] = t.readS();
this._values[n] = t.readS();
if (null != (s = t.readS())) {
null == this._icons && (this._icons = new Array());
this._icons[n] = s;
}
t.position = r;
}
if (null != (s = t.readS())) {
this.text = s;
this._selectedIndex = this._items.indexOf(s);
} else if (this._items.length > 0) {
this._selectedIndex = 0;
this.text = this._items[0];
} else this._selectedIndex = -1;
null != (s = t.readS()) && (this.icon = s);
t.readBool() && (this.titleColor = t.readColor());
(o = t.readInt()) > 0 && (this._visibleItemCount = o);
this._popupDirection = t.readByte();
(o = t.readShort()) >= 0 && (this._selectionController = this.parent.getControllerAt(o));
}
};
i.prototype.showDropdown = function() {
if (this._itemsUpdated) {
this._itemsUpdated = !1;
this._list.removeChildrenToPool();
for (var e = this._items.length, i = 0; i < e; i++) {
var n = this._list.addItemFromPool();
n.name = i < this._values.length ? this._values[i] : "";
n.text = this._items[i];
n.icon = null != this._icons && i < this._icons.length ? this._icons[i] : null;
}
this._list.resizeToFit(this._visibleItemCount);
}
this._list.selectedIndex = -1;
this.dropdown.width = this.width;
var o = null;
this._popupDirection == t.PopupDirection.Down ? o = !0 : this._popupDirection == t.PopupDirection.Up && (o = !1);
this.root.togglePopup(this.dropdown, this, o);
this.dropdown.parent && this.setState(t.GButton.DOWN);
};
i.prototype.onPopupClosed = function() {
this._over ? this.setState(t.GButton.OVER) : this.setState(t.GButton.UP);
};
i.prototype.onClickItem = function(t) {
var e = this, i = this._list.getChildIndex(t);
this._partner.callLater(function(t) {
e.onClickItem2(i);
}, .1);
};
i.prototype.onClickItem2 = function(e) {
this.dropdown.parent instanceof t.GRoot && this.dropdown.parent.hidePopup();
this._selectedIndex = e;
if (this._selectedIndex >= 0) {
this.text = this._items[this._selectedIndex];
this.icon = null != this._icons && this._selectedIndex < this._icons.length ? this._icons[this._selectedIndex] : null;
} else {
this.text = "";
null != this._icons && (this.icon = null);
}
this._node.emit(t.Event.STATUS_CHANGED, this);
};
i.prototype.onRollOver_1 = function() {
this._over = !0;
this._down || this.dropdown && this.dropdown.parent || this.setState(t.GButton.OVER);
};
i.prototype.onRollOut_1 = function() {
this._over = !1;
this._down || this.dropdown && this.dropdown.parent || this.setState(t.GButton.UP);
};
i.prototype.onTouchBegin_1 = function(e) {
if (e.button == cc.Event.EventMouse.BUTTON_LEFT && !(e.initiator instanceof t.GTextInput && e.initiator.editable)) {
this._down = !0;
e.captureTouch();
this.dropdown && this.showDropdown();
}
};
i.prototype.onTouchEnd_1 = function(e) {
if (e.button == cc.Event.EventMouse.BUTTON_LEFT && this._down) {
this._down = !1;
this.dropdown && !this.dropdown.parent && (this._over ? this.setState(t.GButton.OVER) : this.setState(t.GButton.UP));
}
};
return i;
}(t.GComponent);
t.GComboBox = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._type = 0;
t._lineSize = 0;
t._node.name = "GGraph";
t._lineSize = 1;
t._lineColor = cc.Color.BLACK;
t._fillColor = cc.Color.WHITE;
t._cornerRadius = null;
t._content = t._node.addComponent(cc.Graphics);
return t;
}
i.prototype.drawRect = function(e, i, n, o) {
this._type = t.GraphType.Rect;
this._lineSize = e;
this._lineColor = i;
this._fillColor = n;
this._cornerRadius = o;
this.drawCommon();
};
i.prototype.drawEllipse = function(e, i, n) {
this._type = t.GraphType.Ellipse;
this._lineSize = e;
this._lineColor = i;
this._fillColor = n;
this._cornerRadius = null;
this.drawCommon();
};
i.prototype.clearGraphics = function() {
this._type = t.GraphType.PlaceHolder;
this._content.clear();
};
Object.defineProperty(i.prototype, "type", {
get: function() {
return this._type;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "color", {
get: function() {
return this._fillColor;
},
set: function(t) {
this._fillColor = t;
0 != this._type && this.drawCommon();
},
enumerable: !0,
configurable: !0
});
i.prototype.drawCommon = function() {
var t = this._content;
t.clear();
var e = this._width, i = this._height;
if (0 != e && 0 != i) {
t.lineWidth = this._lineSize;
t.strokeColor = this._lineColor;
t.fillColor = this._fillColor;
1 == this._type ? this._cornerRadius ? t.roundRect(0, -i, e, i, 2 * this._cornerRadius[0]) : t.rect(0, -i, e, i) : t.ellipse(e / 2, -i / 2, e / 2, i / 2);
0 != this._lineSize && t.stroke();
t.fill();
}
};
i.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
0 != this._type && this.drawCommon();
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
this._type = t.readByte();
if (0 != this._type) {
this._lineSize = t.readInt();
this._lineColor = t.readColor(!0);
this._fillColor = t.readColor(!0);
if (t.readBool()) {
this._cornerRadius = new Array(4);
for (var n = 0; n < 4; n++) this._cornerRadius[n] = t.readFloat();
}
this.drawCommon();
}
};
return i;
}(t.GObject);
t.GGraph = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._layout = 0;
t._lineGap = 0;
t._columnGap = 0;
t._percentReady = !1;
t._boundsChanged = !1;
t._updating = 0;
t._node.name = "GGroup";
t._touchDisabled = !0;
return t;
}
Object.defineProperty(i.prototype, "layout", {
get: function() {
return this._layout;
},
set: function(t) {
if (this._layout != t) {
this._layout = t;
this.setBoundsChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "lineGap", {
get: function() {
return this._lineGap;
},
set: function(t) {
if (this._lineGap != t) {
this._lineGap = t;
this.setBoundsChangedFlag();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "columnGap", {
get: function() {
return this._columnGap;
},
set: function(t) {
if (this._columnGap != t) {
this._columnGap = t;
this.setBoundsChangedFlag();
}
},
enumerable: !0,
configurable: !0
});
i.prototype.setBoundsChangedFlag = function(e) {
if (0 == this._updating && null != this._parent) {
e && (this._percentReady = !1);
if (!this._boundsChanged) {
this._boundsChanged = !0;
this._layout != t.GroupLayoutType.None && this._partner.callLater(this._ensureBoundsCorrect);
}
}
};
i.prototype._ensureBoundsCorrect = function() {
this.node.$gobj.ensureBoundsCorrect();
};
i.prototype.ensureBoundsCorrect = function() {
this._boundsChanged && this.updateBounds();
};
i.prototype.updateBounds = function() {
this._boundsChanged = !1;
if (null != this._parent) {
this.handleLayout();
var t, e, i, n = this._parent.numChildren, o = Number.POSITIVE_INFINITY, r = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY, a = Number.NEGATIVE_INFINITY, h = !0;
for (t = 0; t < n; t++) if ((e = this._parent.getChildAt(t)).group == this) {
(i = e.x) < o && (o = i);
(i = e.y) < r && (r = i);
(i = e.x + e.width) > s && (s = i);
(i = e.y + e.height) > a && (a = i);
h = !1;
}
if (h) {
this._updating = 2;
this.setSize(0, 0);
} else {
this._updating = 1;
this.setPosition(o, r);
this._updating = 2;
this.setSize(s - o, a - r);
}
this._updating = 0;
}
};
i.prototype.handleLayout = function() {
this._updating |= 1;
var e, i, n;
if (this._layout == t.GroupLayoutType.Horizontal) {
var o = NaN;
n = this._parent.numChildren;
for (i = 0; i < n; i++) if ((e = this._parent.getChildAt(i)).group == this) {
isNaN(o) ? o = Math.floor(e.x) : e.x = o;
0 != e.width && (o += Math.floor(e.width + this._columnGap));
}
this._percentReady || this.updatePercent();
} else if (this._layout == t.GroupLayoutType.Vertical) {
var r = NaN;
n = this._parent.numChildren;
for (i = 0; i < n; i++) if ((e = this._parent.getChildAt(i)).group == this) {
isNaN(r) ? r = Math.floor(e.y) : e.y = r;
0 != e.height && (r += Math.floor(e.height + this._lineGap));
}
this._percentReady || this.updatePercent();
}
this._updating &= 2;
};
i.prototype.updatePercent = function() {
this._percentReady = !0;
var e, i, n = this._parent.numChildren, o = 0;
if (this._layout == t.GroupLayoutType.Horizontal) {
for (e = 0; e < n; e++) (i = this._parent.getChildAt(e)).group == this && (o += i.width);
for (e = 0; e < n; e++) (i = this._parent.getChildAt(e)).group == this && (i._sizePercentInGroup = o > 0 ? i.width / o : 0);
} else {
for (e = 0; e < n; e++) (i = this._parent.getChildAt(e)).group == this && (o += i.height);
for (e = 0; e < n; e++) (i = this._parent.getChildAt(e)).group == this && (i._sizePercentInGroup = o > 0 ? i.height / o : 0);
}
};
i.prototype.moveChildren = function(t, e) {
if (0 == (1 & this._updating) && this._parent) {
this._updating |= 1;
var i, n, o = this._parent.numChildren;
for (i = 0; i < o; i++) (n = this._parent.getChildAt(i)).group == this && n.setPosition(n.x + t, n.y + e);
this._updating &= 2;
}
};
i.prototype.resizeChildren = function(e, i) {
if (this._layout != t.GroupLayoutType.None && 0 == (2 & this._updating) && this._parent) {
this._updating |= 2;
this._percentReady || this.updatePercent();
var n, o, r, s = this._parent.numChildren, a = -1, h = 0, l = 0, c = 0, u = !1;
for (n = 0; n < s; n++) if ((r = this._parent.getChildAt(n)).group == this) {
a = n;
h++;
}
if (this._layout == t.GroupLayoutType.Horizontal) {
c = l = this._width - (h - 1) * this._columnGap;
var _, d = NaN;
for (n = 0; n < s; n++) if ((r = this._parent.getChildAt(n)).group == this) {
isNaN(d) ? d = Math.floor(r.x) : r.x = d;
_ = a == n ? c : Math.round(r._sizePercentInGroup * l);
r.setSize(_, r._rawHeight + i, !0);
c -= r.width;
if (a == n) {
if (c >= 1) for (o = 0; o <= n; o++) if ((r = this._parent.getChildAt(o)).group == this) if (u) r.x += c; else {
_ = r.width + c;
if ((0 == r.maxWidth || _ < r.maxWidth) && (0 == r.minWidth || _ > r.minWidth)) {
r.setSize(_, r.height, !0);
u = !0;
}
}
} else d += r.width + this._columnGap;
}
} else if (this._layout == t.GroupLayoutType.Vertical) {
c = l = this.height - (h - 1) * this._lineGap;
var p, f = NaN;
for (n = 0; n < s; n++) if ((r = this._parent.getChildAt(n)).group == this) {
isNaN(f) ? f = Math.floor(r.y) : r.y = f;
p = a == n ? c : Math.round(r._sizePercentInGroup * l);
r.setSize(r._rawWidth + e, p, !0);
c -= r.height;
if (a == n) {
if (c >= 1) for (o = 0; o <= n; o++) if ((r = this._parent.getChildAt(o)).group == this) if (u) r.y += c; else {
p = r.height + c;
if ((0 == r.maxHeight || p < r.maxHeight) && (0 == r.minHeight || p > r.minHeight)) {
r.setSize(r.width, p, !0);
u = !0;
}
}
} else f += r.height + this._lineGap;
}
}
this._updating &= 1;
}
};
i.prototype.setChildrenAlpha = function() {
if (!this._underConstruct && this._parent) for (var t = this._parent.numChildren, e = 0; e < t; e++) {
var i = this._parent.getChildAt(e);
i.group == this && (i.alpha = this._alpha);
}
};
i.prototype.setChildrenVisible = function() {
if (this._parent) for (var t = this._parent.numChildren, e = 0; e < t; e++) {
var i = this._parent.getChildAt(e);
i.group == this && i.handleVisibleChanged();
}
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
this._layout = t.readByte();
this._lineGap = t.readInt();
this._columnGap = t.readInt();
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
this._visible || this.setChildrenVisible();
};
return i;
}(t.GObject);
t.GGroup = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._node.name = "GImage";
i._touchDisabled = !0;
i._content = i._node.addComponent(t.Image);
return i;
}
Object.defineProperty(i.prototype, "color", {
get: function() {
return this._node.color;
},
set: function(t) {
if (this._node.color != t) {
this._node.color = t;
this.updateGear(4);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "flip", {
get: function() {
return this._content.flip;
},
set: function(t) {
this._content.flip = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillMethod", {
get: function() {
return this._content.fillMethod;
},
set: function(t) {
this._content.fillMethod = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillOrigin", {
get: function() {
return this._content.fillOrigin;
},
set: function(t) {
this._content.fillOrigin = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillClockwise", {
get: function() {
return this._content.fillClockwise;
},
set: function(t) {
this._content.fillClockwise = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillAmount", {
get: function() {
return this._content.fillAmount;
},
set: function(t) {
this._content.fillAmount = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.constructFromResource = function() {
this.sourceWidth = this.packageItem.width;
this.sourceHeight = this.packageItem.height;
this.initWidth = this.sourceWidth;
this.initHeight = this.sourceHeight;
this.setSize(this.sourceWidth, this.sourceHeight);
this.packageItem.load();
this.packageItem.scale9Grid ? this._content.type = cc.Sprite.Type.SLICED : this.packageItem.scaleByTile && (this._content.type = cc.Sprite.Type.TILED);
this._content.spriteFrame = this.packageItem.asset;
this._content.setState(this._grayed ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
};
i.prototype.handleGrayedChanged = function() {
this._content.setState(this._grayed ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
t.readBool() && (this.color = t.readColor());
this._content.flip = t.readByte();
this._content.fillMethod = t.readByte();
if (0 != this._content.fillMethod) {
this._content.fillOrigin = t.readByte();
this._content.fillClockwise = t.readBool();
this._content.fillAmount = t.readFloat();
}
};
return i;
}(t.GObject);
t.GImage = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._node.name = "GLabel";
return t;
}
Object.defineProperty(i.prototype, "icon", {
get: function() {
if (null != this._iconObject) return this._iconObject.icon;
},
set: function(t) {
null != this._iconObject && (this._iconObject.icon = t);
this.updateGear(7);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "title", {
get: function() {
return this._titleObject ? this._titleObject.text : null;
},
set: function(t) {
this._titleObject && (this._titleObject.text = t);
this.updateGear(6);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "text", {
get: function() {
return this.title;
},
set: function(t) {
this.title = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleColor", {
get: function() {
var t = this.getTextField();
return null != t ? t.color : cc.Color.WHITE;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.color = t);
this.updateGear(4);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "color", {
get: function() {
return this.titleColor;
},
set: function(t) {
this.titleColor = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "titleFontSize", {
get: function() {
var t = this.getTextField();
return null != t ? t.fontSize : 0;
},
set: function(t) {
var e = this.getTextField();
null != e && (e.fontSize = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "editable", {
get: function() {
return !!(this._titleObject && this._titleObject instanceof t.GTextInput) && this._titleObject.asTextInput.editable;
},
set: function(t) {
this._titleObject && (this._titleObject.asTextInput.editable = t);
},
enumerable: !0,
configurable: !0
});
i.prototype.getTextField = function() {
return this._titleObject instanceof t.GTextField ? this._titleObject : this._titleObject instanceof i ? this._titleObject.getTextField() : this._titleObject instanceof t.GButton ? this._titleObject.getTextField() : null;
};
i.prototype.constructExtension = function(t) {
this._titleObject = this.getChild("title");
this._iconObject = this.getChild("icon");
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
if (t.seek(i, 6) && t.readByte() == this.packageItem.objectType) {
var n;
null != (n = t.readS()) && (this.title = n);
null != (n = t.readS()) && (this.icon = n);
t.readBool() && (this.titleColor = t.readColor());
var o = t.readInt();
0 != o && (this.titleFontSize = o);
if (t.readBool()) {
var r = this.getTextField();
if (null != r) {
null != (n = t.readS()) && (r.promptText = n);
null != (n = t.readS()) && (r.restrict = n);
0 != (o = t.readInt()) && (r.maxLength = o);
o = t.readInt();
t.readBool() && (r.password = !0);
} else t.skip(13);
}
}
};
return i;
}(t.GComponent);
t.GLabel = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(n, e);
function n() {
var i = e.call(this) || this;
i.scrollItemToViewOnClick = !0;
i.foldInvisibleItems = !1;
i._lineCount = 0;
i._columnCount = 0;
i._lineGap = 0;
i._columnGap = 0;
i._lastSelectedIndex = 0;
i._numItems = 0;
i._realNumItems = 0;
i._firstIndex = 0;
i._curLineItemCount = 0;
i._curLineItemCount2 = 0;
i._virtualListChanged = 0;
i.itemInfoVer = 0;
i._node.name = "GList";
i._trackBounds = !0;
i._pool = new t.GObjectPool();
i._layout = t.ListLayoutType.SingleColumn;
i._autoResizeItem = !0;
i._lastSelectedIndex = -1;
i._selectionMode = t.ListSelectionMode.Single;
i.opaque = !0;
i._align = t.AlignType.Left;
i._verticalAlign = t.VertAlignType.Top;
return i;
}
n.prototype.dispose = function() {
this._pool.clear();
e.prototype.dispose.call(this);
};
Object.defineProperty(n.prototype, "layout", {
get: function() {
return this._layout;
},
set: function(t) {
if (this._layout != t) {
this._layout = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "lineCount", {
get: function() {
return this._lineCount;
},
set: function(t) {
if (this._lineCount != t) {
this._lineCount = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "columnCount", {
get: function() {
return this._columnCount;
},
set: function(t) {
if (this._columnCount != t) {
this._columnCount = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "lineGap", {
get: function() {
return this._lineGap;
},
set: function(t) {
if (this._lineGap != t) {
this._lineGap = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "columnGap", {
get: function() {
return this._columnGap;
},
set: function(t) {
if (this._columnGap != t) {
this._columnGap = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "align", {
get: function() {
return this._align;
},
set: function(t) {
if (this._align != t) {
this._align = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "verticalAlign", {
get: function() {
return this._verticalAlign;
},
set: function(t) {
if (this._verticalAlign != t) {
this._verticalAlign = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "virtualItemSize", {
get: function() {
return this._itemSize;
},
set: function(t) {
if (this._virtual) {
null == this._itemSize && (this._itemSize = new cc.Size(0, 0));
this._itemSize.width = t.width;
this._itemSize.height = t.height;
this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "defaultItem", {
get: function() {
return this._defaultItem;
},
set: function(t) {
this._defaultItem = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "autoResizeItem", {
get: function() {
return this._autoResizeItem;
},
set: function(t) {
if (this._autoResizeItem != t) {
this._autoResizeItem = t;
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "selectionMode", {
get: function() {
return this._selectionMode;
},
set: function(t) {
this._selectionMode = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "selectionController", {
get: function() {
return this._selectionController;
},
set: function(t) {
this._selectionController = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "itemPool", {
get: function() {
return this._pool;
},
enumerable: !0,
configurable: !0
});
n.prototype.getFromPool = function(t) {
void 0 === t && (t = null);
t || (t = this._defaultItem);
var e = this._pool.getObject(t);
null != e && (e.visible = !0);
return e;
};
n.prototype.returnToPool = function(t) {
this._pool.returnObject(t);
};
n.prototype.addChildAt = function(i, n) {
void 0 === n && (n = 0);
e.prototype.addChildAt.call(this, i, n);
if (i instanceof t.GButton) {
var o = i;
o.selected = !1;
o.changeStateOnClick = !1;
}
i.on(t.Event.CLICK, this.onClickItem, this);
return i;
};
n.prototype.addItem = function(e) {
void 0 === e && (e = null);
e || (e = this._defaultItem);
return this.addChild(t.UIPackage.createObjectFromURL(e));
};
n.prototype.addItemFromPool = function(t) {
void 0 === t && (t = null);
return this.addChild(this.getFromPool(t));
};
n.prototype.removeChildAt = function(i, n) {
var o = e.prototype.removeChildAt.call(this, i, n);
o.off(t.Event.CLICK, this.onClickItem, this);
return o;
};
n.prototype.removeChildToPoolAt = function(t) {
var i = e.prototype.removeChildAt.call(this, t);
this.returnToPool(i);
};
n.prototype.removeChildToPool = function(t) {
e.prototype.removeChild.call(this, t);
this.returnToPool(t);
};
n.prototype.removeChildrenToPool = function(t, e) {
void 0 == t && (t = 0);
void 0 == e && (e = -1);
(e < 0 || e >= this._children.length) && (e = this._children.length - 1);
for (var i = t; i <= e; ++i) this.removeChildToPoolAt(t);
};
Object.defineProperty(n.prototype, "selectedIndex", {
get: function() {
var e;
if (this._virtual) for (e = 0; e < this._realNumItems; e++) {
var i = this._virtualItems[e];
if (i.obj instanceof t.GButton && i.obj.selected || null == i.obj && i.selected) return this._loop ? e % this._numItems : e;
} else {
var n = this._children.length;
for (e = 0; e < n; e++) {
var o = this._children[e].asButton;
if (null != o && o.selected) return e;
}
}
return -1;
},
set: function(e) {
if (e >= 0 && e < this.numItems) {
this._selectionMode != t.ListSelectionMode.Single && this.clearSelection();
this.addSelection(e);
} else this.clearSelection();
},
enumerable: !0,
configurable: !0
});
n.prototype.getSelection = function() {
var e, i = new Array();
if (this._virtual) for (e = 0; e < this._realNumItems; e++) {
var n = this._virtualItems[e];
if (n.obj instanceof t.GButton && n.obj.selected || null == n.obj && n.selected) {
var o = e;
if (this._loop) {
o = e % this._numItems;
if (-1 != i.indexOf(o)) continue;
}
i.push(o);
}
} else {
var r = this._children.length;
for (e = 0; e < r; e++) {
var s = this._children[e].asButton;
null != s && s.selected && i.push(e);
}
}
return i;
};
n.prototype.addSelection = function(e, i) {
if (this._selectionMode != t.ListSelectionMode.None) {
this.checkVirtualList();
this._selectionMode == t.ListSelectionMode.Single && this.clearSelection();
i && this.scrollToView(e);
this._lastSelectedIndex = e;
var n = null;
if (this._virtual) {
var o = this._virtualItems[e];
null != o.obj && (n = o.obj.asButton);
o.selected = !0;
} else n = this.getChildAt(e).asButton;
if (null != n && !n.selected) {
n.selected = !0;
this.updateSelectionController(e);
}
}
};
n.prototype.removeSelection = function(e) {
if (this._selectionMode != t.ListSelectionMode.None) {
var i = null;
if (this._virtual) {
var n = this._virtualItems[e];
null != n.obj && (i = n.obj.asButton);
n.selected = !1;
} else i = this.getChildAt(e).asButton;
null != i && (i.selected = !1);
}
};
n.prototype.clearSelection = function() {
var e;
if (this._virtual) for (e = 0; e < this._realNumItems; e++) {
var i = this._virtualItems[e];
i.obj instanceof t.GButton && (i.obj.selected = !1);
i.selected = !1;
} else {
var n = this._children.length;
for (e = 0; e < n; e++) {
var o = this._children[e].asButton;
null != o && (o.selected = !1);
}
}
};
n.prototype.clearSelectionExcept = function(e) {
var i;
if (this._virtual) for (i = 0; i < this._realNumItems; i++) {
var n = this._virtualItems[i];
if (n.obj != e) {
n.obj instanceof t.GButton && (n.obj.selected = !1);
n.selected = !1;
}
} else {
var o = this._children.length;
for (i = 0; i < o; i++) {
var r = this._children[i].asButton;
null != r && r != e && (r.selected = !1);
}
}
};
n.prototype.selectAll = function() {
this.checkVirtualList();
var e, i = -1;
if (this._virtual) for (e = 0; e < this._realNumItems; e++) {
var n = this._virtualItems[e];
if (n.obj instanceof t.GButton && !n.obj.selected) {
n.obj.selected = !0;
i = e;
}
n.selected = !0;
} else {
var o = this._children.length;
for (e = 0; e < o; e++) {
var r = this._children[e].asButton;
if (null != r && !r.selected) {
r.selected = !0;
i = e;
}
}
}
-1 != i && this.updateSelectionController(i);
};
n.prototype.selectNone = function() {
this.clearSelection();
};
n.prototype.selectReverse = function() {
this.checkVirtualList();
var e, i = -1;
if (this._virtual) for (e = 0; e < this._realNumItems; e++) {
var n = this._virtualItems[e];
if (n.obj instanceof t.GButton) {
n.obj.selected = !n.obj.selected;
n.obj.selected && (i = e);
}
n.selected = !n.selected;
} else {
var o = this._children.length;
for (e = 0; e < o; e++) {
var r = this._children[e].asButton;
if (null != r) {
r.selected = !r.selected;
r.selected && (i = e);
}
}
}
-1 != i && this.updateSelectionController(i);
};
n.prototype.handleArrowKey = function(e) {
var i = this.selectedIndex;
if (-1 != i) switch (e) {
case 1:
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowVertical) {
if (--i >= 0) {
this.clearSelection();
this.addSelection(i, !0);
}
} else if (this._layout == t.ListLayoutType.FlowHorizontal || this._layout == t.ListLayoutType.Pagination) {
for (var n = this._children[i], o = 0, r = i - 1; r >= 0; r--) {
var s = this._children[r];
if (s.y != n.y) {
n = s;
break;
}
o++;
}
for (;r >= 0; r--) if ((s = this._children[r]).y != n.y) {
this.clearSelection();
this.addSelection(r + o + 1, !0);
break;
}
}
break;

case 3:
if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowHorizontal || this._layout == t.ListLayoutType.Pagination) {
if (++i < this._children.length) {
this.clearSelection();
this.addSelection(i, !0);
}
} else if (this._layout == t.ListLayoutType.FlowVertical) {
n = this._children[i];
o = 0;
var a = this._children.length;
for (r = i + 1; r < a; r++) {
if ((s = this._children[r]).x != n.x) {
n = s;
break;
}
o++;
}
for (;r < a; r++) if ((s = this._children[r]).x != n.x) {
this.clearSelection();
this.addSelection(r - o - 1, !0);
break;
}
}
break;

case 5:
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowVertical) {
if (++i < this._children.length) {
this.clearSelection();
this.addSelection(i, !0);
}
} else if (this._layout == t.ListLayoutType.FlowHorizontal || this._layout == t.ListLayoutType.Pagination) {
n = this._children[i];
o = 0;
a = this._children.length;
for (r = i + 1; r < a; r++) {
if ((s = this._children[r]).y != n.y) {
n = s;
break;
}
o++;
}
for (;r < a; r++) if ((s = this._children[r]).y != n.y) {
this.clearSelection();
this.addSelection(r - o - 1, !0);
break;
}
}
break;

case 7:
if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowHorizontal || this._layout == t.ListLayoutType.Pagination) {
if (--i >= 0) {
this.clearSelection();
this.addSelection(i, !0);
}
} else if (this._layout == t.ListLayoutType.FlowVertical) {
n = this._children[i];
o = 0;
for (r = i - 1; r >= 0; r--) {
if ((s = this._children[r]).x != n.x) {
n = s;
break;
}
o++;
}
for (;r >= 0; r--) if ((s = this._children[r]).x != n.x) {
this.clearSelection();
this.addSelection(r + o + 1, !0);
break;
}
}
}
};
n.prototype.onClickItem = function(e) {
if (null == this._scrollPane || !this._scrollPane.isDragged) {
var i = t.GObject.cast(e.currentTarget);
this.setSelectionOnEvent(i, e);
this._scrollPane && this.scrollItemToViewOnClick && this._scrollPane.scrollToView(i, !0);
this._node.emit(t.Event.CLICK_ITEM, i, e);
}
};
n.prototype.setSelectionOnEvent = function(e, i) {
if (e instanceof t.GButton && this._selectionMode != t.ListSelectionMode.None) {
var n = !1, o = e, r = this.childIndexToItemIndex(this.getChildIndex(e));
if (this._selectionMode == t.ListSelectionMode.Single) {
if (!o.selected) {
this.clearSelectionExcept(o);
o.selected = !0;
}
} else if (i.isShiftDown) {
if (!o.selected) if (-1 != this._lastSelectedIndex) {
var s, a = Math.min(this._lastSelectedIndex, r), h = Math.max(this._lastSelectedIndex, r);
h = Math.min(h, this.numItems - 1);
if (this._virtual) for (s = a; s <= h; s++) {
var l = this._virtualItems[s];
l.obj instanceof t.GButton && (l.obj.selected = !0);
l.selected = !0;
} else for (s = a; s <= h; s++) {
var c = this.getChildAt(s).asButton;
null != c && (c.selected = !0);
}
n = !0;
} else o.selected = !0;
} else if (i.isCtrlDown || this._selectionMode == t.ListSelectionMode.Multiple_SingleClick) o.selected = !o.selected; else if (o.selected) this.clearSelectionExcept(o); else {
this.clearSelectionExcept(o);
o.selected = !0;
}
n || (this._lastSelectedIndex = r);
o.selected && this.updateSelectionController(r);
}
};
n.prototype.resizeToFit = function(e, i) {
void 0 === e && (e = Number.POSITIVE_INFINITY);
void 0 === i && (i = 0);
this.ensureBoundsCorrect();
var n = this.numItems;
e > n && (e = n);
if (this._virtual) {
var o = Math.ceil(e / this._curLineItemCount);
this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal ? this.viewHeight = o * this._itemSize.height + Math.max(0, o - 1) * this._lineGap : this.viewWidth = o * this._itemSize.width + Math.max(0, o - 1) * this._columnGap;
} else if (0 == e) this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal ? this.viewHeight = i : this.viewWidth = i; else {
for (var r = e - 1, s = null; r >= 0; ) {
s = this.getChildAt(r);
if (!this.foldInvisibleItems || s.visible) break;
r--;
}
if (r < 0) this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal ? this.viewHeight = i : this.viewWidth = i; else {
var a = 0;
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
(a = s.y + s.height) < i && (a = i);
this.viewHeight = a;
} else {
(a = s.x + s.width) < i && (a = i);
this.viewWidth = a;
}
}
}
};
n.prototype.getMaxItemWidth = function() {
for (var t = this._children.length, e = 0, i = 0; i < t; i++) {
var n = this.getChildAt(i);
n.width > e && (e = n.width);
}
return e;
};
n.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
this.setBoundsChangedFlag();
this._virtual && this.setVirtualListChangedFlag(!0);
};
n.prototype.handleControllerChanged = function(t) {
e.prototype.handleControllerChanged.call(this, t);
this._selectionController == t && (this.selectedIndex = t.selectedIndex);
};
n.prototype.updateSelectionController = function(t) {
if (null != this._selectionController && !this._selectionController.changing && t < this._selectionController.pageCount) {
var e = this._selectionController;
this._selectionController = null;
e.selectedIndex = t;
this._selectionController = e;
}
};
n.prototype.getSnappingPosition = function(i, o, r) {
if (this._virtual) {
r = r || new cc.Vec2();
var s, a;
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
s = o;
n.pos_param = o;
a = this.getIndexOnPos1(!1);
o = n.pos_param;
a < this._virtualItems.length && s - o > this._virtualItems[a].height / 2 && a < this._realNumItems && (o += this._virtualItems[a].height + this._lineGap);
} else if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowVertical) {
s = i;
n.pos_param = i;
a = this.getIndexOnPos2(!1);
i = n.pos_param;
a < this._virtualItems.length && s - i > this._virtualItems[a].width / 2 && a < this._realNumItems && (i += this._virtualItems[a].width + this._columnGap);
} else {
s = i;
n.pos_param = i;
a = this.getIndexOnPos3(!1);
i = n.pos_param;
a < this._virtualItems.length && s - i > this._virtualItems[a].width / 2 && a < this._realNumItems && (i += this._virtualItems[a].width + this._columnGap);
}
r.x = i;
r.y = o;
return r;
}
return e.prototype.getSnappingPosition.call(this, i, o, r);
};
n.prototype.scrollToView = function(e, i, n) {
if (this._virtual) {
if (0 == this._numItems) return;
this.checkVirtualList();
if (e >= this._virtualItems.length) throw "Invalid child index: " + e + ">" + this._virtualItems.length;
this._loop && (e = Math.floor(this._firstIndex / this._numItems) * this._numItems + e);
var o, r, s = this._virtualItems[e], a = 0;
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
for (r = this._curLineItemCount - 1; r < e; r += this._curLineItemCount) a += this._virtualItems[r].height + this._lineGap;
o = new cc.Rect(0, a, this._itemSize.width, s.height);
} else if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowVertical) {
for (r = this._curLineItemCount - 1; r < e; r += this._curLineItemCount) a += this._virtualItems[r].width + this._columnGap;
o = new cc.Rect(a, 0, s.width, this._itemSize.height);
} else {
var h = e / (this._curLineItemCount * this._curLineItemCount2);
o = new cc.Rect(h * this.viewWidth + e % this._curLineItemCount * (s.width + this._columnGap), e / this._curLineItemCount % this._curLineItemCount2 * (s.height + this._lineGap), s.width, s.height);
}
n = !0;
null != this._scrollPane && this._scrollPane.scrollToView(o, i, n);
} else {
var l = this.getChildAt(e);
null != l && (null != this._scrollPane ? this._scrollPane.scrollToView(l, i, n) : null != this.parent && null != this.parent.scrollPane && this.parent.scrollPane.scrollToView(l, i, n));
}
};
n.prototype.getFirstChildInView = function() {
return this.childIndexToItemIndex(e.prototype.getFirstChildInView.call(this));
};
n.prototype.childIndexToItemIndex = function(e) {
if (!this._virtual) return e;
if (this._layout == t.ListLayoutType.Pagination) {
for (var i = this._firstIndex; i < this._realNumItems; i++) if (null != this._virtualItems[i].obj && --e < 0) return i;
return e;
}
e += this._firstIndex;
this._loop && this._numItems > 0 && (e %= this._numItems);
return e;
};
n.prototype.itemIndexToChildIndex = function(e) {
if (!this._virtual) return e;
if (this._layout == t.ListLayoutType.Pagination) return this.getChildIndex(this._virtualItems[e].obj);
if (this._loop && this._numItems > 0) {
var i = this._firstIndex % this._numItems;
e >= i ? e -= i : e = this._numItems - i + e;
} else e -= this._firstIndex;
return e;
};
n.prototype.setVirtual = function() {
this._setVirtual(!1);
};
n.prototype.setVirtualAndLoop = function() {
this._setVirtual(!0);
};
n.prototype._setVirtual = function(e) {
if (!this._virtual) {
if (null == this._scrollPane) throw "Virtual list must be scrollable!";
if (e) {
if (this._layout == t.ListLayoutType.FlowHorizontal || this._layout == t.ListLayoutType.FlowVertical) throw "Loop list is not supported for FlowHorizontal or FlowVertical layout!";
this._scrollPane.bouncebackEffect = !1;
}
this._virtual = !0;
this._loop = e;
this._virtualItems = new Array();
this.removeChildrenToPool();
if (null == this._itemSize) {
this._itemSize = new cc.Size(0, 0);
var i = this.getFromPool(null);
if (null == i) throw "Virtual List must have a default list item resource.";
this._itemSize.width = i.width;
this._itemSize.height = i.height;
this.returnToPool(i);
}
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
this._scrollPane.scrollStep = this._itemSize.height;
this._loop && (this._scrollPane._loop = 2);
} else {
this._scrollPane.scrollStep = this._itemSize.width;
this._loop && (this._scrollPane._loop = 1);
}
this._node.on(t.Event.SCROLL, this.__scrolled, this);
this.setVirtualListChangedFlag(!0);
}
};
Object.defineProperty(n.prototype, "numItems", {
get: function() {
return this._virtual ? this._numItems : this._children.length;
},
set: function(t) {
if (this._virtual) {
if (null == this.itemRenderer) throw "Set itemRenderer first!";
this._numItems = t;
this._loop ? this._realNumItems = 6 * this._numItems : this._realNumItems = this._numItems;
var e = this._virtualItems.length;
if (this._realNumItems > e) for (r = e; r < this._realNumItems; r++) {
var n = new i();
n.width = this._itemSize.width;
n.height = this._itemSize.height;
this._virtualItems.push(n);
} else for (r = this._realNumItems; r < e; r++) this._virtualItems[r].selected = !1;
0 != this._virtualListChanged && this._partner.unschedule(this._refreshVirtualList);
this._refreshVirtualList();
} else {
var o = this._children.length;
if (t > o) for (var r = o; r < t; r++) null == this.itemProvider ? this.addItemFromPool() : this.addItemFromPool(this.itemProvider(r)); else this.removeChildrenToPool(t, o);
if (null != this.itemRenderer) for (r = 0; r < t; r++) this.itemRenderer(r, this.getChildAt(r));
}
},
enumerable: !0,
configurable: !0
});
n.prototype.refreshVirtualList = function() {
this.setVirtualListChangedFlag(!1);
};
n.prototype.checkVirtualList = function() {
if (0 != this._virtualListChanged) {
this._refreshVirtualList();
this._partner.unschedule(this._refreshVirtualList);
}
};
n.prototype.setVirtualListChangedFlag = function(t) {
t ? this._virtualListChanged = 2 : 0 == this._virtualListChanged && (this._virtualListChanged = 1);
this._partner.callLater(this._refreshVirtualList);
};
n.prototype._refreshVirtualList = function(e) {
if (isNaN(e)) {
var i = 2 == this._virtualListChanged;
this._virtualListChanged = 0;
this._eventLocked = !0;
if (i) if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.SingleRow) this._curLineItemCount = 1; else if (this._layout == t.ListLayoutType.FlowHorizontal) if (this._columnCount > 0) this._curLineItemCount = this._columnCount; else {
this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
this._curLineItemCount <= 0 && (this._curLineItemCount = 1);
} else if (this._layout == t.ListLayoutType.FlowVertical) if (this._lineCount > 0) this._curLineItemCount = this._lineCount; else {
this._curLineItemCount = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
this._curLineItemCount <= 0 && (this._curLineItemCount = 1);
} else {
if (this._columnCount > 0) this._curLineItemCount = this._columnCount; else {
this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
this._curLineItemCount <= 0 && (this._curLineItemCount = 1);
}
if (this._lineCount > 0) this._curLineItemCount2 = this._lineCount; else {
this._curLineItemCount2 = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
this._curLineItemCount2 <= 0 && (this._curLineItemCount2 = 1);
}
}
var n = 0, o = 0;
if (this._realNumItems > 0) {
var r, s = Math.ceil(this._realNumItems / this._curLineItemCount) * this._curLineItemCount, a = Math.min(this._curLineItemCount, this._realNumItems);
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
for (r = 0; r < s; r += this._curLineItemCount) n += this._virtualItems[r].height + this._lineGap;
n > 0 && (n -= this._lineGap);
if (this._autoResizeItem) o = this._scrollPane.viewWidth; else {
for (r = 0; r < a; r++) o += this._virtualItems[r].width + this._columnGap;
o > 0 && (o -= this._columnGap);
}
} else if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowVertical) {
for (r = 0; r < s; r += this._curLineItemCount) o += this._virtualItems[r].width + this._columnGap;
o > 0 && (o -= this._columnGap);
if (this._autoResizeItem) n = this._scrollPane.viewHeight; else {
for (r = 0; r < a; r++) n += this._virtualItems[r].height + this._lineGap;
n > 0 && (n -= this._lineGap);
}
} else {
o = Math.ceil(s / (this._curLineItemCount * this._curLineItemCount2)) * this.viewWidth;
n = this.viewHeight;
}
}
this.handleAlign(o, n);
this._scrollPane.setContentSize(o, n);
this._eventLocked = !1;
this.handleScroll(!0);
} else {
this.node.$gobj._refreshVirtualList();
}
};
n.prototype.__scrolled = function(t) {
this.handleScroll(!1);
};
n.prototype.getIndexOnPos1 = function(t) {
if (this._realNumItems < this._curLineItemCount) {
n.pos_param = 0;
return 0;
}
var e, i, o;
if (this.numChildren > 0 && !t) {
if ((i = this.getChildAt(0).y) > n.pos_param) {
for (e = this._firstIndex - this._curLineItemCount; e >= 0; e -= this._curLineItemCount) if ((i -= this._virtualItems[e].height + this._lineGap) <= n.pos_param) {
n.pos_param = i;
return e;
}
n.pos_param = 0;
return 0;
}
for (e = this._firstIndex; e < this._realNumItems; e += this._curLineItemCount) {
if ((o = i + this._virtualItems[e].height + this._lineGap) > n.pos_param) {
n.pos_param = i;
return e;
}
i = o;
}
n.pos_param = i;
return this._realNumItems - this._curLineItemCount;
}
i = 0;
for (e = 0; e < this._realNumItems; e += this._curLineItemCount) {
if ((o = i + this._virtualItems[e].height + this._lineGap) > n.pos_param) {
n.pos_param = i;
return e;
}
i = o;
}
n.pos_param = i;
return this._realNumItems - this._curLineItemCount;
};
n.prototype.getIndexOnPos2 = function(t) {
if (this._realNumItems < this._curLineItemCount) {
n.pos_param = 0;
return 0;
}
var e, i, o;
if (this.numChildren > 0 && !t) {
if ((i = this.getChildAt(0).x) > n.pos_param) {
for (e = this._firstIndex - this._curLineItemCount; e >= 0; e -= this._curLineItemCount) if ((i -= this._virtualItems[e].width + this._columnGap) <= n.pos_param) {
n.pos_param = i;
return e;
}
n.pos_param = 0;
return 0;
}
for (e = this._firstIndex; e < this._realNumItems; e += this._curLineItemCount) {
if ((o = i + this._virtualItems[e].width + this._columnGap) > n.pos_param) {
n.pos_param = i;
return e;
}
i = o;
}
n.pos_param = i;
return this._realNumItems - this._curLineItemCount;
}
i = 0;
for (e = 0; e < this._realNumItems; e += this._curLineItemCount) {
if ((o = i + this._virtualItems[e].width + this._columnGap) > n.pos_param) {
n.pos_param = i;
return e;
}
i = o;
}
n.pos_param = i;
return this._realNumItems - this._curLineItemCount;
};
n.prototype.getIndexOnPos3 = function(t) {
if (this._realNumItems < this._curLineItemCount) {
n.pos_param = 0;
return 0;
}
var e, i, o = this.viewWidth, r = Math.floor(n.pos_param / o), s = r * (this._curLineItemCount * this._curLineItemCount2), a = r * o;
for (e = 0; e < this._curLineItemCount; e++) {
if ((i = a + this._virtualItems[s + e].width + this._columnGap) > n.pos_param) {
n.pos_param = a;
return s + e;
}
a = i;
}
n.pos_param = a;
return s + this._curLineItemCount - 1;
};
n.prototype.handleScroll = function(e) {
if (!this._eventLocked) {
if (this._layout == t.ListLayoutType.SingleColumn || this._layout == t.ListLayoutType.FlowHorizontal) {
for (var i = 0; this.handleScroll1(e); ) {
e = !1;
if (++i > 20) {
console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
break;
}
}
this.handleArchOrder1();
} else if (this._layout == t.ListLayoutType.SingleRow || this._layout == t.ListLayoutType.FlowVertical) {
i = 0;
for (;this.handleScroll2(e); ) {
e = !1;
if (++i > 20) {
console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
break;
}
}
this.handleArchOrder2();
} else this.handleScroll3(e);
this._boundsChanged = !1;
}
};
n.prototype.handleScroll1 = function(e) {
var i = this._scrollPane.scrollingPosY, o = i + this._scrollPane.viewHeight, r = o == this._scrollPane.contentHeight;
n.pos_param = i;
var s = this.getIndexOnPos1(e);
i = n.pos_param;
if (s == this._firstIndex && !e) return !1;
var a = this._firstIndex;
this._firstIndex = s;
var h, l, c, u, _, d = s, p = a > s, f = this.numChildren, g = a + f - 1, y = p ? g : a, m = 0, b = i, v = 0, w = 0, C = this.defaultItem, S = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
this.itemInfoVer++;
for (;d < this._realNumItems && (r || b < o); ) {
if (null == (l = this._virtualItems[d]).obj || e) {
if (null != this.itemProvider) {
null == (C = this.itemProvider(d % this._numItems)) && (C = this._defaultItem);
C = t.UIPackage.normalizeURL(C);
}
if (null != l.obj && l.obj.resourceURL != C) {
l.obj instanceof t.GButton && (l.selected = l.obj.selected);
this.removeChildToPool(l.obj);
l.obj = null;
}
}
if (null == l.obj) {
if (p) {
for (_ = y; _ >= a; _--) if (null != (c = this._virtualItems[_]).obj && c.updateFlag != this.itemInfoVer && c.obj.resourceURL == C) {
c.obj instanceof t.GButton && (c.selected = c.obj.selected);
l.obj = c.obj;
c.obj = null;
_ == y && y--;
break;
}
} else for (_ = y; _ <= g; _++) if (null != (c = this._virtualItems[_]).obj && c.updateFlag != this.itemInfoVer && c.obj.resourceURL == C) {
c.obj instanceof t.GButton && (c.selected = c.obj.selected);
l.obj = c.obj;
c.obj = null;
_ == y && y++;
break;
}
if (null != l.obj) this.setChildIndex(l.obj, p ? d - s : this.numChildren); else {
l.obj = this._pool.getObject(C);
p ? this.addChildAt(l.obj, d - s) : this.addChild(l.obj);
}
l.obj instanceof t.GButton && (l.obj.selected = l.selected);
h = !0;
} else h = e;
if (h) {
this._autoResizeItem && (this._layout == t.ListLayoutType.SingleColumn || this._columnCount > 0) && l.obj.setSize(S, l.obj.height, !0);
this.itemRenderer(d % this._numItems, l.obj);
if (d % this._curLineItemCount == 0) {
v += Math.ceil(l.obj.height) - l.height;
d == s && a > s && (w = Math.ceil(l.obj.height) - l.height);
}
l.width = Math.ceil(l.obj.width);
l.height = Math.ceil(l.obj.height);
}
l.updateFlag = this.itemInfoVer;
l.obj.setPosition(m, b);
d == s && (o += l.height);
m += l.width + this._columnGap;
if (d % this._curLineItemCount == this._curLineItemCount - 1) {
m = 0;
b += l.height + this._lineGap;
}
d++;
}
for (u = 0; u < f; u++) if ((l = this._virtualItems[a + u]).updateFlag != this.itemInfoVer && null != l.obj) {
l.obj instanceof t.GButton && (l.selected = l.obj.selected);
this.removeChildToPool(l.obj);
l.obj = null;
}
f = this._children.length;
for (u = 0; u < f; u++) {
var T = this._virtualItems[s + u].obj;
this._children[u] != T && this.setChildIndex(T, u);
}
0 == v && 0 == w || this._scrollPane.changeContentSizeOnScrolling(0, v, 0, w);
return d > 0 && this.numChildren > 0 && this._container.y < 0 && this.getChildAt(0).y > -this._container.y;
};
n.prototype.handleScroll2 = function(e) {
var i = this._scrollPane.scrollingPosX, o = i + this._scrollPane.viewWidth, r = i == this._scrollPane.contentWidth;
n.pos_param = i;
var s = this.getIndexOnPos2(e);
i = n.pos_param;
if (s == this._firstIndex && !e) return !1;
var a = this._firstIndex;
this._firstIndex = s;
var h, l, c, u, _, d = s, p = a > s, f = this.numChildren, g = a + f - 1, y = p ? g : a, m = i, b = 0, v = 0, w = 0, C = this.defaultItem, S = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
this.itemInfoVer++;
for (;d < this._realNumItems && (r || m < o); ) {
if (null == (l = this._virtualItems[d]).obj || e) {
if (null != this.itemProvider) {
null == (C = this.itemProvider(d % this._numItems)) && (C = this._defaultItem);
C = t.UIPackage.normalizeURL(C);
}
if (null != l.obj && l.obj.resourceURL != C) {
l.obj instanceof t.GButton && (l.selected = l.obj.selected);
this.removeChildToPool(l.obj);
l.obj = null;
}
}
if (null == l.obj) {
if (p) {
for (_ = y; _ >= a; _--) if (null != (c = this._virtualItems[_]).obj && c.updateFlag != this.itemInfoVer && c.obj.resourceURL == C) {
c.obj instanceof t.GButton && (c.selected = c.obj.selected);
l.obj = c.obj;
c.obj = null;
_ == y && y--;
break;
}
} else for (_ = y; _ <= g; _++) if (null != (c = this._virtualItems[_]).obj && c.updateFlag != this.itemInfoVer && c.obj.resourceURL == C) {
c.obj instanceof t.GButton && (c.selected = c.obj.selected);
l.obj = c.obj;
c.obj = null;
_ == y && y++;
break;
}
if (null != l.obj) this.setChildIndex(l.obj, p ? d - s : this.numChildren); else {
l.obj = this._pool.getObject(C);
p ? this.addChildAt(l.obj, d - s) : this.addChild(l.obj);
}
l.obj instanceof t.GButton && (l.obj.selected = l.selected);
h = !0;
} else h = e;
if (h) {
this._autoResizeItem && (this._layout == t.ListLayoutType.SingleRow || this._lineCount > 0) && l.obj.setSize(l.obj.width, S, !0);
this.itemRenderer(d % this._numItems, l.obj);
if (d % this._curLineItemCount == 0) {
v += Math.ceil(l.obj.width) - l.width;
d == s && a > s && (w = Math.ceil(l.obj.width) - l.width);
}
l.width = Math.ceil(l.obj.width);
l.height = Math.ceil(l.obj.height);
}
l.updateFlag = this.itemInfoVer;
l.obj.setPosition(m, b);
d == s && (o += l.width);
b += l.height + this._lineGap;
if (d % this._curLineItemCount == this._curLineItemCount - 1) {
b = 0;
m += l.width + this._columnGap;
}
d++;
}
for (u = 0; u < f; u++) if ((l = this._virtualItems[a + u]).updateFlag != this.itemInfoVer && null != l.obj) {
l.obj instanceof t.GButton && (l.selected = l.obj.selected);
this.removeChildToPool(l.obj);
l.obj = null;
}
f = this._children.length;
for (u = 0; u < f; u++) {
var T = this._virtualItems[s + u].obj;
this._children[u] != T && this.setChildIndex(T, u);
}
0 == v && 0 == w || this._scrollPane.changeContentSizeOnScrolling(v, 0, w, 0);
return d > 0 && this.numChildren > 0 && this._container.x < 0 && this.getChildAt(0).x > -this._container.x;
};
n.prototype.handleScroll3 = function(e) {
var i = this._scrollPane.scrollingPosX;
n.pos_param = i;
var o = this.getIndexOnPos3(e);
i = n.pos_param;
if (o != this._firstIndex || e) {
var r = this._firstIndex;
this._firstIndex = o;
var s, a, h, l, c, u = r, _ = this._virtualItems.length, d = this._curLineItemCount * this._curLineItemCount2, p = o % this._curLineItemCount, f = this.viewWidth, g = Math.floor(o / d) * d, y = g + 2 * d, m = this._defaultItem, b = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount, v = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount2 - 1)) / this._curLineItemCount2;
this.itemInfoVer++;
for (a = g; a < y; a++) if (!(a >= this._realNumItems)) {
c = a % this._curLineItemCount;
if (a - g < d) {
if (c < p) continue;
} else if (c > p) continue;
(h = this._virtualItems[a]).updateFlag = this.itemInfoVer;
}
var w = null, C = 0;
for (a = g; a < y; a++) if (!(a >= this._realNumItems) && (h = this._virtualItems[a]).updateFlag == this.itemInfoVer) {
if (null == h.obj) {
for (;u < _; ) {
if (null != (l = this._virtualItems[u]).obj && l.updateFlag != this.itemInfoVer) {
l.obj instanceof t.GButton && (l.selected = l.obj.selected);
h.obj = l.obj;
l.obj = null;
break;
}
u++;
}
-1 == C && (C = this.getChildIndex(w) + 1);
if (null == h.obj) {
if (null != this.itemProvider) {
null == (m = this.itemProvider(a % this._numItems)) && (m = this._defaultItem);
m = t.UIPackage.normalizeURL(m);
}
h.obj = this._pool.getObject(m);
this.addChildAt(h.obj, C);
} else C = this.setChildIndexBefore(h.obj, C);
C++;
h.obj instanceof t.GButton && (h.obj.selected = h.selected);
s = !0;
} else {
s = e;
C = -1;
w = h.obj;
}
if (s) {
this._autoResizeItem && (this._curLineItemCount == this._columnCount && this._curLineItemCount2 == this._lineCount ? h.obj.setSize(b, v, !0) : this._curLineItemCount == this._columnCount ? h.obj.setSize(b, h.obj.height, !0) : this._curLineItemCount2 == this._lineCount && h.obj.setSize(h.obj.width, v, !0));
this.itemRenderer(a % this._numItems, h.obj);
h.width = Math.ceil(h.obj.width);
h.height = Math.ceil(h.obj.height);
}
}
var S = g / d * f, T = S, x = 0, I = 0;
for (a = g; a < y; a++) if (!(a >= this._realNumItems)) {
(h = this._virtualItems[a]).updateFlag == this.itemInfoVer && h.obj.setPosition(T, x);
h.height > I && (I = h.height);
if (a % this._curLineItemCount == this._curLineItemCount - 1) {
T = S;
x += I + this._lineGap;
I = 0;
if (a == g + d - 1) {
T = S += f;
x = 0;
}
} else T += h.width + this._columnGap;
}
for (a = u; a < _; a++) if ((h = this._virtualItems[a]).updateFlag != this.itemInfoVer && null != h.obj) {
h.obj instanceof t.GButton && (h.selected = h.obj.selected);
this.removeChildToPool(h.obj);
h.obj = null;
}
}
};
n.prototype.handleArchOrder1 = function() {
if (this._childrenRenderOrder == t.ChildrenRenderOrder.Arch) {
for (var e = this._scrollPane.posY + this.viewHeight / 2, i = Number.POSITIVE_INFINITY, n = 0, o = 0, r = this.numChildren, s = 0; s < r; s++) {
var a = this.getChildAt(s);
if ((!this.foldInvisibleItems || a.visible) && (n = Math.abs(e - a.y - a.height / 2)) < i) {
i = n;
o = s;
}
}
this.apexIndex = o;
}
};
n.prototype.handleArchOrder2 = function() {
if (this._childrenRenderOrder == t.ChildrenRenderOrder.Arch) {
for (var e = this._scrollPane.posX + this.viewWidth / 2, i = Number.POSITIVE_INFINITY, n = 0, o = 0, r = this.numChildren, s = 0; s < r; s++) {
var a = this.getChildAt(s);
if ((!this.foldInvisibleItems || a.visible) && (n = Math.abs(e - a.x - a.width / 2)) < i) {
i = n;
o = s;
}
}
this.apexIndex = o;
}
};
n.prototype.handleAlign = function(e, i) {
var n = 0, o = 0;
i < this.viewHeight && (this._verticalAlign == t.VertAlignType.Middle ? o = Math.floor((this.viewHeight - i) / 2) : this._verticalAlign == t.VertAlignType.Bottom && (o = this.viewHeight - i));
e < this.viewWidth && (this._align == t.AlignType.Center ? n = Math.floor((this.viewWidth - e) / 2) : this._align == t.AlignType.Right && (n = this.viewWidth - e));
if (n != this._alignOffset.x || o != this._alignOffset.y) {
this._alignOffset.x = n;
this._alignOffset.y = o;
if (null != this._scrollPane) this._scrollPane.adjustMaskContainer(); else {
this._container.x = this._margin.left + this._alignOffset.x;
this._container.y = this._margin.top + this._alignOffset.y;
}
}
};
n.prototype.updateBounds = function() {
if (!this._virtual) {
var e, i, n = 0, o = 0, r = 0, s = 0, a = 0, h = 0, l = 0, c = 0, u = 0, _ = this._children.length, d = this.viewWidth, p = this.viewHeight, f = 0, g = 0, y = 0;
if (this._layout == t.ListLayoutType.SingleColumn) {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
0 != o && (o += this._lineGap);
i.y = o;
this._autoResizeItem && i.setSize(d, i.height, !0);
o += Math.ceil(i.height);
i.width > r && (r = i.width);
}
}
a = Math.ceil(r);
h = o;
} else if (this._layout == t.ListLayoutType.SingleRow) {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
0 != n && (n += this._columnGap);
i.x = n;
this._autoResizeItem && i.setSize(i.width, p, !0);
n += Math.ceil(i.width);
i.height > s && (s = i.height);
}
}
a = n;
h = Math.ceil(s);
} else if (this._layout == t.ListLayoutType.FlowHorizontal) if (this._autoResizeItem && this._columnCount > 0) {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
f += i.sourceWidth;
if (++l == this._columnCount || e == _ - 1) {
y = (d - f - (l - 1) * this._columnGap) / f;
n = 0;
for (l = g; l <= e; l++) {
i = this.getChildAt(l);
if (!this.foldInvisibleItems || i.visible) {
i.setPosition(n, o);
if (l < e) {
i.setSize(i.sourceWidth + Math.round(i.sourceWidth * y), i.height, !0);
n += Math.ceil(i.width) + this._columnGap;
} else i.setSize(d - n, i.height, !0);
i.height > s && (s = i.height);
}
}
o += Math.ceil(s) + this._lineGap;
s = 0;
l = 0;
g = e + 1;
f = 0;
}
}
}
h = o + Math.ceil(s);
a = d;
} else {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
0 != n && (n += this._columnGap);
if (0 != this._columnCount && l >= this._columnCount || 0 == this._columnCount && n + i.width > d && 0 != s) {
n = 0;
o += Math.ceil(s) + this._lineGap;
s = 0;
l = 0;
}
i.setPosition(n, o);
(n += Math.ceil(i.width)) > r && (r = n);
i.height > s && (s = i.height);
l++;
}
}
h = o + Math.ceil(s);
a = Math.ceil(r);
} else if (this._layout == t.ListLayoutType.FlowVertical) if (this._autoResizeItem && this._lineCount > 0) {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
f += i.sourceHeight;
if (++l == this._lineCount || e == _ - 1) {
y = (p - f - (l - 1) * this._lineGap) / f;
o = 0;
for (l = g; l <= e; l++) {
i = this.getChildAt(l);
if (!this.foldInvisibleItems || i.visible) {
i.setPosition(n, o);
if (l < e) {
i.setSize(i.width, i.sourceHeight + Math.round(i.sourceHeight * y), !0);
o += Math.ceil(i.height) + this._lineGap;
} else i.setSize(i.width, p - o, !0);
i.width > r && (r = i.width);
}
}
n += Math.ceil(r) + this._columnGap;
r = 0;
l = 0;
g = e + 1;
f = 0;
}
}
}
a = n + Math.ceil(r);
h = p;
} else {
for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
0 != o && (o += this._lineGap);
if (0 != this._lineCount && l >= this._lineCount || 0 == this._lineCount && o + i.height > p && 0 != r) {
o = 0;
n += Math.ceil(r) + this._columnGap;
r = 0;
l = 0;
}
i.setPosition(n, o);
(o += Math.ceil(i.height)) > s && (s = o);
i.width > r && (r = i.width);
l++;
}
}
a = n + Math.ceil(r);
h = Math.ceil(s);
} else {
var m;
this._autoResizeItem && this._lineCount > 0 && (m = Math.floor((p - (this._lineCount - 1) * this._lineGap) / this._lineCount));
if (this._autoResizeItem && this._columnCount > 0) for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
if (0 == l && (0 != this._lineCount && u >= this._lineCount || 0 == this._lineCount && o + (this._lineCount > 0 ? m : i.height) > p)) {
c++;
o = 0;
u = 0;
}
f += i.sourceWidth;
if (++l == this._columnCount || e == _ - 1) {
y = (d - f - (l - 1) * this._columnGap) / f;
n = 0;
for (l = g; l <= e; l++) {
i = this.getChildAt(l);
if (!this.foldInvisibleItems || i.visible) {
i.setPosition(c * d + n, o);
if (l < e) {
i.setSize(i.sourceWidth + Math.round(i.sourceWidth * y), this._lineCount > 0 ? m : i.height, !0);
n += Math.ceil(i.width) + this._columnGap;
} else i.setSize(d - n, this._lineCount > 0 ? m : i.height, !0);
i.height > s && (s = i.height);
}
}
o += Math.ceil(s) + this._lineGap;
s = 0;
l = 0;
g = e + 1;
f = 0;
u++;
}
}
} else for (e = 0; e < _; e++) {
i = this.getChildAt(e);
if (!this.foldInvisibleItems || i.visible) {
0 != n && (n += this._columnGap);
this._autoResizeItem && this._lineCount > 0 && i.setSize(i.width, m, !0);
if (0 != this._columnCount && l >= this._columnCount || 0 == this._columnCount && n + i.width > d && 0 != s) {
n = 0;
o += Math.ceil(s) + this._lineGap;
s = 0;
l = 0;
u++;
if (0 != this._lineCount && u >= this._lineCount || 0 == this._lineCount && o + i.height > p && 0 != r) {
c++;
o = 0;
u = 0;
}
}
i.setPosition(c * d + n, o);
(n += Math.ceil(i.width)) > r && (r = n);
i.height > s && (s = i.height);
l++;
}
}
h = c > 0 ? p : o + Math.ceil(s);
a = (c + 1) * d;
}
this.handleAlign(a, h);
this.setBounds(0, 0, a, h);
}
};
n.prototype.setup_beforeAdd = function(i, n) {
e.prototype.setup_beforeAdd.call(this, i, n);
i.seek(n, 5);
var o, r, s, a, h;
this._layout = i.readByte();
this._selectionMode = i.readByte();
this._align = i.readByte();
this._verticalAlign = i.readByte();
this._lineGap = i.readShort();
this._columnGap = i.readShort();
this._lineCount = i.readShort();
this._columnCount = i.readShort();
this._autoResizeItem = i.readBool();
this._childrenRenderOrder = i.readByte();
this._apexIndex = i.readShort();
if (i.readBool()) {
this._margin.top = i.readInt();
this._margin.bottom = i.readInt();
this._margin.left = i.readInt();
this._margin.right = i.readInt();
}
var l = i.readByte();
if (l == t.OverflowType.Scroll) {
var c = i.position;
i.seek(n, 7);
this.setupScroll(i);
i.position = c;
} else this.setupOverflow(l);
i.readBool() && i.skip(8);
i.seek(n, 8);
this._defaultItem = i.readS();
var u = i.readShort();
for (o = 0; o < u; o++) {
a = i.readShort();
a += i.position;
if (null != (h = i.readS()) || (h = this.defaultItem)) {
var _ = this.getFromPool(h);
if (null != _) {
this.addChild(_);
null != (h = i.readS()) && (_.text = h);
null != (h = i.readS()) && _ instanceof t.GButton && (_.selectedTitle = h);
null != (h = i.readS()) && (_.icon = h);
null != (h = i.readS()) && _ instanceof t.GButton && (_.selectedIcon = h);
null != (h = i.readS()) && (_.name = h);
if (_ instanceof t.GComponent) {
s = i.readShort();
for (r = 0; r < s; r++) {
var d = _.getController(i.readS());
h = i.readS();
null != d && (d.selectedPageId = h);
}
}
}
i.position = a;
} else i.position = a;
}
};
n.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
t.seek(i, 6);
var n = t.readShort();
-1 != n && (this._selectionController = this.parent.getControllerAt(n));
};
return n;
}(t.GComponent);
t.GList = e;
var i = function() {
return function() {
this.width = 0;
this.height = 0;
this.updateFlag = 0;
this.selected = !1;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {
this._count = 0;
this._pool = {};
}
e.prototype.clear = function() {
for (var t in this._pool) for (var e = this._pool[t], i = e.length, n = 0; n < i; n++) e[n].dispose();
this._pool = {};
this._count = 0;
};
Object.defineProperty(e.prototype, "count", {
get: function() {
return this._count;
},
enumerable: !0,
configurable: !0
});
e.prototype.getObject = function(e) {
if (null == (e = t.UIPackage.normalizeURL(e))) return null;
var i = this._pool[e];
if (null != i && i.length) {
this._count--;
return i.shift();
}
return t.UIPackage.createObjectFromURL(e);
};
e.prototype.returnObject = function(t) {
var e = t.resourceURL;
if (e) {
var i = this._pool[e];
if (null == i) {
i = new Array();
this._pool[e] = i;
}
this._count++;
i.push(t);
}
};
return e;
}();
t.GObjectPool = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._frame = 0;
i._contentSourceWidth = 0;
i._contentSourceHeight = 0;
i._contentWidth = 0;
i._contentHeight = 0;
i._node.name = "GLoader";
i._playing = !0;
i._url = "";
i._fill = t.LoaderFillType.None;
i._align = t.AlignType.Left;
i._verticalAlign = t.VertAlignType.Top;
i._showErrorSign = !0;
i._color = cc.Color.WHITE;
i._container = new cc.Node("Image");
i._container.setAnchorPoint(0, 1);
i._node.addChild(i._container);
i._content = i._container.addComponent(t.MovieClip);
return i;
}
i.prototype.dispose = function() {
null == this._contentItem && null != this._content.spriteFrame && this.freeExternal(this._content.spriteFrame);
null != this._content2 && this._content2.dispose();
e.prototype.dispose.call(this);
};
Object.defineProperty(i.prototype, "url", {
get: function() {
return this._url;
},
set: function(t) {
if (this._url != t) {
this._url = t;
this.loadContent();
this.updateGear(7);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "icon", {
get: function() {
return this._url;
},
set: function(t) {
this.url = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "align", {
get: function() {
return this._align;
},
set: function(t) {
if (this._align != t) {
this._align = t;
this.updateLayout();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "verticalAlign", {
get: function() {
return this._verticalAlign;
},
set: function(t) {
if (this._verticalAlign != t) {
this._verticalAlign = t;
this.updateLayout();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fill", {
get: function() {
return this._fill;
},
set: function(t) {
if (this._fill != t) {
this._fill = t;
this.updateLayout();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "shrinkOnly", {
get: function() {
return this._shrinkOnly;
},
set: function(t) {
if (this._shrinkOnly != t) {
this._shrinkOnly = t;
this.updateLayout();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "autoSize", {
get: function() {
return this._autoSize;
},
set: function(t) {
if (this._autoSize != t) {
this._autoSize = t;
this.updateLayout();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "playing", {
get: function() {
return this._playing;
},
set: function(e) {
if (this._playing != e) {
this._playing = e;
this._content instanceof t.MovieClip && (this._content.playing = e);
this.updateGear(5);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "frame", {
get: function() {
return this._frame;
},
set: function(e) {
if (this._frame != e) {
this._frame = e;
this._content instanceof t.MovieClip && (this._content.frame = e);
this.updateGear(5);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "timeScale", {
get: function() {
return this._content instanceof t.MovieClip ? this._content.timeScale : 1;
},
set: function(e) {
this._content instanceof t.MovieClip && (this._content.timeScale = e);
},
enumerable: !0,
configurable: !0
});
i.prototype.advance = function(e) {
this._content instanceof t.MovieClip && this._content.advance(e);
};
Object.defineProperty(i.prototype, "color", {
get: function() {
return this._color;
},
set: function(t) {
if (this._color != t) {
this._color = t;
this.updateGear(4);
this._container.color = t;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillMethod", {
get: function() {
return this._content.fillMethod;
},
set: function(t) {
this._content.fillMethod = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillOrigin", {
get: function() {
return this._content.fillOrigin;
},
set: function(t) {
this._content.fillOrigin = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillClockwise", {
get: function() {
return this._content.fillClockwise;
},
set: function(t) {
this._content.fillClockwise = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillAmount", {
get: function() {
return this._content.fillAmount;
},
set: function(t) {
this._content.fillAmount = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "showErrorSign", {
get: function() {
return this._showErrorSign;
},
set: function(t) {
this._showErrorSign = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "component", {
get: function() {
return this._content2;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "texture", {
get: function() {
return this._content.spriteFrame;
},
set: function(t) {
this.url = null;
this._content.spriteFrame = t;
this._content.type = cc.Sprite.Type.SIMPLE;
if (null != t) {
this._contentSourceWidth = t.getRect().width;
this._contentSourceHeight = t.getRect().height;
} else this._contentSourceWidth = this._contentHeight = 0;
this.updateLayout();
},
enumerable: !0,
configurable: !0
});
i.prototype.loadContent = function() {
this.clearContent();
this._url && (t.ToolSet.startsWith(this._url, "ui://") ? this.loadFromPackage(this._url) : this.loadExternal());
};
i.prototype.loadFromPackage = function(e) {
this._contentItem = t.UIPackage.getItemByURL(e);
if (null != this._contentItem) {
this._contentItem.load();
this._autoSize && this.setSize(this._contentItem.width, this._contentItem.height);
if (this._contentItem.type == t.PackageItemType.Image) if (this._contentItem.asset) {
this._content.spriteFrame = this._contentItem.asset;
this._contentItem.scale9Grid ? this._content.type = cc.Sprite.Type.SLICED : this._contentItem.scaleByTile ? this._content.type = cc.Sprite.Type.TILED : this._content.type = cc.Sprite.Type.SIMPLE;
this._contentSourceWidth = this._contentItem.width;
this._contentSourceHeight = this._contentItem.height;
this.updateLayout();
} else this.setErrorState(); else if (this._contentItem.type == t.PackageItemType.MovieClip) {
this._contentSourceWidth = this._contentItem.width;
this._contentSourceHeight = this._contentItem.height;
this._content.interval = this._contentItem.interval;
this._content.swing = this._contentItem.swing;
this._content.repeatDelay = this._contentItem.repeatDelay;
this._content.frames = this._contentItem.frames;
this.updateLayout();
} else if (this._contentItem.type == t.PackageItemType.Component) {
var i = t.UIPackage.createObjectFromURL(e);
if (i) if (i instanceof t.GComponent) {
this._content2 = i.asCom;
this._container.addChild(this._content2.node);
this._contentSourceWidth = this._contentItem.width;
this._contentSourceHeight = this._contentItem.height;
this.updateLayout();
} else {
i.dispose();
this.setErrorState();
} else this.setErrorState();
} else this.setErrorState();
} else this.setErrorState();
};
i.prototype.loadExternal = function() {
t.ToolSet.startsWith(this._url, "http://") || t.ToolSet.startsWith(this._url, "https://") ? cc.loader.load(this._url, this.onLoaded.bind(this)) : cc.loader.loadRes(this._url, cc.Asset, this.onLoaded.bind(this));
};
i.prototype.onLoaded = function(t, e) {
this._url && cc.isValid(this._node) && (e = cc.loader.getRes(this._url)) && (e instanceof cc.SpriteFrame ? this.onExternalLoadSuccess(e) : e instanceof cc.Texture2D && this.onExternalLoadSuccess(new cc.SpriteFrame(e)));
};
i.prototype.freeExternal = function(t) {};
i.prototype.onExternalLoadSuccess = function(t) {
this._content.spriteFrame = t;
this._content.type = cc.Sprite.Type.SIMPLE;
this._contentSourceWidth = t.getRect().width;
this._contentSourceHeight = t.getRect().height;
this.updateLayout();
};
i.prototype.onExternalLoadFailed = function() {
this.setErrorState();
};
i.prototype.setErrorState = function() {
if (this._showErrorSign) {
null == this._errorSign && null != t.UIConfig.loaderErrorSign && (this._errorSign = i._errorSignPool.getObject(t.UIConfig.loaderErrorSign));
if (null != this._errorSign) {
this._errorSign.setSize(this.width, this.height);
this._container.addChild(this._errorSign.node);
}
}
};
i.prototype.clearErrorState = function() {
if (null != this._errorSign) {
this._container.removeChild(this._errorSign.node);
i._errorSignPool.returnObject(this._errorSign);
this._errorSign = null;
}
};
i.prototype.updateLayout = function() {
if (null != this._content2 || null != this._content) {
this._contentWidth = this._contentSourceWidth;
this._contentHeight = this._contentSourceHeight;
var e = -this.pivotX * this._width, i = this.pivotY * this._height;
if (this._autoSize) {
this._updatingLayout = !0;
0 == this._contentWidth && (this._contentWidth = 50);
0 == this._contentHeight && (this._contentHeight = 30);
this.setSize(this._contentWidth, this._contentHeight);
this._updatingLayout = !1;
this._container.setContentSize(this._width, this._height);
this._container.setPosition(e, i);
if (null != this._content2) {
this._content2.setPosition(e - this._width / 2, i - this._height / 2);
this._content2.setScale(1, 1);
}
if (this._contentWidth == this._width && this._contentHeight == this._height) return;
}
var n, o, r = 1, s = 1;
if (this._fill != t.LoaderFillType.None) {
r = this.width / this._contentSourceWidth;
s = this.height / this._contentSourceHeight;
if (1 != r || 1 != s) {
this._fill == t.LoaderFillType.ScaleMatchHeight ? r = s : this._fill == t.LoaderFillType.ScaleMatchWidth ? s = r : this._fill == t.LoaderFillType.Scale ? r > s ? r = s : s = r : this._fill == t.LoaderFillType.ScaleNoBorder && (r > s ? s = r : r = s);
if (this._shrinkOnly) {
r > 1 && (r = 1);
s > 1 && (s = 1);
}
this._contentWidth = this._contentSourceWidth * r;
this._contentHeight = this._contentSourceHeight * s;
}
}
this._container.setContentSize(this._contentWidth, this._contentHeight);
if (null != this._content2) {
this._content2.setPosition(e - this._width / 2, i - this._height / 2);
this._content2.setScale(r, s);
}
n = this._align == t.AlignType.Left ? 0 : this._align == t.AlignType.Center ? Math.floor((this._width - this._contentWidth) / 2) : this._width - this._contentWidth;
o = -(o = this._verticalAlign == t.VertAlignType.Top ? 0 : this._verticalAlign == t.VertAlignType.Middle ? Math.floor((this._height - this._contentHeight) / 2) : this._height - this._contentHeight);
this._container.setPosition(e + n, i + o);
} else if (this._autoSize) {
this._updatingLayout = !0;
this.setSize(50, 30);
this._updatingLayout = !1;
}
};
i.prototype.clearContent = function() {
this.clearErrorState();
if (null == this._contentItem) {
var t = this._content.spriteFrame;
null != t && this.freeExternal(t);
}
if (null != this._content2) {
this._container.removeChild(this._content2.node);
this._content2.dispose();
this._content2 = null;
}
this._content.frames = null;
this._content.spriteFrame = null;
this._contentItem = null;
};
i.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
this._updatingLayout || this.updateLayout();
};
i.prototype.handleAnchorChanged = function() {
e.prototype.handleAnchorChanged.call(this);
this._updatingLayout || this.updateLayout();
};
i.prototype.handleGrayedChanged = function() {
this._content.setState(this._grayed ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
};
i.prototype.hitTest = function(t) {
if (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy) return null;
if (this._content2) {
var e = this._content2.hitTest(t);
if (e) return e;
}
var i = this._node.convertToNodeSpace(t);
return i.x >= 0 && i.y >= 0 && i.x < this._width && i.y < this._height ? this : null;
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
this._url = t.readS();
this._align = t.readByte();
this._verticalAlign = t.readByte();
this._fill = t.readByte();
this._shrinkOnly = t.readBool();
this._autoSize = t.readBool();
this._showErrorSign = t.readBool();
this._playing = t.readBool();
this._frame = t.readInt();
t.readBool() && (this.color = t.readColor());
this._content.fillMethod = t.readByte();
if (0 != this._content.fillMethod) {
this._content.fillOrigin = t.readByte();
this._content.fillClockwise = t.readBool();
this._content.fillAmount = t.readFloat();
}
this._url && this.loadContent();
};
i._errorSignPool = new t.GObjectPool();
return i;
}(t.GObject);
t.GLoader = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._node.name = "GMovieClip";
i._touchDisabled = !0;
i._content = i._node.addComponent(t.MovieClip);
return i;
}
Object.defineProperty(i.prototype, "color", {
get: function() {
return cc.Color.WHITE;
},
set: function(t) {
if (this._node.color != t) {
this._node.color = t;
this.updateGear(4);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "playing", {
get: function() {
return this._content.playing;
},
set: function(t) {
if (this._content.playing != t) {
this._content.playing = t;
this.updateGear(5);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "frame", {
get: function() {
return this._content.frame;
},
set: function(t) {
if (this._content.frame != t) {
this._content.frame = t;
this.updateGear(5);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "timeScale", {
get: function() {
return this._content.timeScale;
},
set: function(t) {
this._content.timeScale = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.rewind = function() {
this._content.rewind();
};
i.prototype.syncStatus = function(t) {
this._content.syncStatus(t._content);
};
i.prototype.advance = function(t) {
this._content.advance(t);
};
i.prototype.setPlaySettings = function(t, e, i, n, o, r) {
this._content.setPlaySettings(t, e, i, n, o, r);
};
i.prototype.handleGrayedChanged = function() {
this._content.setState(this._grayed ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
};
i.prototype.constructFromResource = function() {
this.sourceWidth = this.packageItem.width;
this.sourceHeight = this.packageItem.height;
this.initWidth = this.sourceWidth;
this.initHeight = this.sourceHeight;
this.setSize(this.sourceWidth, this.sourceHeight);
this.packageItem.load();
this._content.interval = this.packageItem.interval;
this._content.swing = this.packageItem.swing;
this._content.repeatDelay = this.packageItem.repeatDelay;
this._content.frames = this.packageItem.frames;
this._content.smoothing = this.packageItem.smoothing;
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
t.readBool() && (this.color = t.readColor());
t.readByte();
this._content.frame = t.readInt();
this._content.playing = t.readBool();
};
return i;
}(t.GObject);
t.GMovieClip = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._max = 0;
i._value = 0;
i._barMaxWidth = 0;
i._barMaxHeight = 0;
i._barMaxWidthDelta = 0;
i._barMaxHeightDelta = 0;
i._barStartX = 0;
i._barStartY = 0;
i._tweening = !1;
i._node.name = "GProgressBar";
i._titleType = t.ProgressTitleType.Percent;
i._value = 50;
i._max = 100;
return i;
}
Object.defineProperty(i.prototype, "titleType", {
get: function() {
return this._titleType;
},
set: function(t) {
if (this._titleType != t) {
this._titleType = t;
this.update(this._value);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "max", {
get: function() {
return this._max;
},
set: function(t) {
if (this._max != t) {
this._max = t;
this.update(this._value);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "value", {
get: function() {
return this._value;
},
set: function(e) {
if (this._tweening) {
t.GTween.kill(this, !0, this.update);
this._tweening = !1;
}
if (this._value != e) {
this._value = e;
this.update(this._value);
}
},
enumerable: !0,
configurable: !0
});
i.prototype.tweenValue = function(e, i) {
if (this._value != e) {
if (this._tweening) {
t.GTween.kill(this, !1, this.update);
this._tweening = !1;
}
var n = this._value;
this._value = e;
this._tweening = !0;
return t.GTween.to(n, this._value, i).setTarget(this, this.update).setEase(t.EaseType.Linear).onComplete(function() {
this._tweening = !1;
}, this);
}
return null;
};
i.prototype.update = function(e) {
var i = 0 != this._max ? Math.min(e / this._max, 1) : 0;
if (this._titleObject) switch (this._titleType) {
case t.ProgressTitleType.Percent:
this._titleObject.text = Math.round(100 * i) + "%";
break;

case t.ProgressTitleType.ValueAndMax:
this._titleObject.text = Math.round(e) + "/" + Math.round(this._max);
break;

case t.ProgressTitleType.Value:
this._titleObject.text = "" + Math.round(e);
break;

case t.ProgressTitleType.Max:
this._titleObject.text = "" + Math.round(this._max);
}
var n = this.width - this._barMaxWidthDelta, o = this.height - this._barMaxHeightDelta;
if (this._reverse) {
if (this._barObjectH) if (this._barObjectH instanceof t.GImage && this._barObjectH.fillMethod != t.FillMethod.None) this._barObjectH.fillAmount = 1 - i; else {
this._barObjectH.width = Math.round(n * i);
this._barObjectH.x = this._barStartX + (n - this._barObjectH.width);
}
if (this._barObjectV) if (this._barObjectV instanceof t.GImage && this._barObjectV.fillMethod != t.FillMethod.None) this._barObjectV.fillAmount = 1 - i; else {
this._barObjectV.height = Math.round(o * i);
this._barObjectV.y = this._barStartY + (o - this._barObjectV.height);
}
} else {
this._barObjectH && (this._barObjectH instanceof t.GImage && this._barObjectH.fillMethod != t.FillMethod.None ? this._barObjectH.fillAmount = i : this._barObjectH.width = Math.round(n * i));
this._barObjectV && (this._barObjectV instanceof t.GImage && this._barObjectV.fillMethod != t.FillMethod.None ? this._barObjectV.fillAmount = i : this._barObjectV.height = Math.round(o * i));
}
this._aniObject instanceof t.GMovieClip && (this._aniObject.frame = Math.round(100 * i));
};
i.prototype.constructExtension = function(t) {
t.seek(0, 6);
this._titleType = t.readByte();
this._reverse = t.readBool();
this._titleObject = this.getChild("title");
this._barObjectH = this.getChild("bar");
this._barObjectV = this.getChild("bar_v");
this._aniObject = this.getChild("ani");
if (this._barObjectH) {
this._barMaxWidth = this._barObjectH.width;
this._barMaxWidthDelta = this.width - this._barMaxWidth;
this._barStartX = this._barObjectH.x;
}
if (this._barObjectV) {
this._barMaxHeight = this._barObjectV.height;
this._barMaxHeightDelta = this.height - this._barMaxHeight;
this._barStartY = this._barObjectV.y;
}
};
i.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
this._barObjectH && (this._barMaxWidth = this.width - this._barMaxWidthDelta);
this._barObjectV && (this._barMaxHeight = this.height - this._barMaxHeightDelta);
this._underConstruct || this.update(this._value);
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
if (t.seek(i, 6)) if (t.readByte() == this.packageItem.objectType) {
this._value = t.readInt();
this._max = t.readInt();
this.update(this._value);
} else this.update(this._value); else this.update(this._value);
};
i.prototype.onDestroy = function() {
e.prototype.onDestroy.call(this);
this._tweening && t.GTween.kill(this);
};
return i;
}(t.GComponent);
t.GProgressBar = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._fontSize = 0;
t._leading = 0;
t._node.name = "GTextField";
t._touchDisabled = !0;
t._text = "";
t._color = cc.Color.WHITE;
t._strokeColor = cc.Color.BLACK;
t._templateVars = null;
t.createRenderer();
t.fontSize = 12;
t.leading = 3;
t.singleLine = !1;
t._sizeDirty = !1;
t._node.on(cc.Node.EventType.SIZE_CHANGED, t.onLabelSizeChanged, t);
return t;
}
i.prototype.createRenderer = function() {
this._label = this._node.addComponent(cc.Label);
this.autoSize = t.AutoSizeType.Both;
};
Object.defineProperty(i.prototype, "text", {
get: function() {
return this._text;
},
set: function(t) {
this._text = t;
null == this._text && (this._text = "");
this.updateGear(6);
this.markSizeChanged();
this.updateText();
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "font", {
get: function() {
return this._font;
},
set: function(e) {
if (this._font != e || !e) {
this._font = e;
this.markSizeChanged();
var i = e || t.UIConfig.defaultFont;
if (t.ToolSet.startsWith(i, "ui://")) {
var n = t.UIPackage.getItemByURL(i);
if (n) {
this.updateFont(n.owner.getItemAsset(n));
return;
}
}
this.updateFont(i);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fontSize", {
get: function() {
return this._fontSize;
},
set: function(t) {
if (!(t < 0) && this._fontSize != t) {
this._fontSize = t;
this.markSizeChanged();
this.updateFontSize();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "color", {
get: function() {
return this._color;
},
set: function(t) {
if (this._color != t) {
this._color = t;
this.updateGear(4);
this.updateFontColor();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "align", {
get: function() {
return this._label.horizontalAlign;
},
set: function(t) {
this._label.horizontalAlign = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "verticalAlign", {
get: function() {
return this._label.verticalAlign;
},
set: function(t) {
this._label.verticalAlign = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "leading", {
get: function() {
return this._leading;
},
set: function(t) {
if (this._leading != t) {
this._leading = t;
this.markSizeChanged();
this.updateFontSize();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "letterSpacing", {
get: function() {
return this._label.spacingX;
},
set: function(t) {
if (this._label.spacingX != t) {
this.markSizeChanged();
this._label.spacingX = t;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "underline", {
get: function() {
return !1;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "bold", {
get: function() {
return !1;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "italic", {
get: function() {
return !1;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "singleLine", {
get: function() {
return !this._label.enableWrapText;
},
set: function(t) {
this._label.enableWrapText = !t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "stroke", {
get: function() {
return this._outline && this._outline.enabled ? this._outline.width : 0;
},
set: function(t) {
if (0 == t) this._outline && (this._outline.enabled = !1); else {
if (this._outline) this._outline.enabled = !0; else {
this._outline = this._node.addComponent(cc.LabelOutline);
this.updateStrokeColor();
}
this._outline.width = t;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "strokeColor", {
get: function() {
return this._strokeColor;
},
set: function(t) {
if (this._strokeColor != t) {
this._strokeColor = t;
this.updateGear(4);
this.updateStrokeColor();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "ubbEnabled", {
get: function() {
return this._ubbEnabled;
},
set: function(t) {
if (this._ubbEnabled != t) {
this._ubbEnabled = t;
this.markSizeChanged();
this.updateText();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "autoSize", {
get: function() {
return this._autoSize;
},
set: function(t) {
if (this._autoSize != t) {
this._autoSize = t;
this.markSizeChanged();
this.updateOverflow();
}
},
enumerable: !0,
configurable: !0
});
i.prototype.parseTemplate = function(t) {
for (var e, i, n, o, r = 0, s = ""; -1 != (e = t.indexOf("{", r)); ) if (e > 0 && 92 == t.charCodeAt(e - 1)) {
s += t.substring(r, e - 1);
s += "{";
r = e + 1;
} else {
s += t.substring(r, e);
r = e;
if (-1 == (e = t.indexOf("}", r))) break;
if (e != r + 1) {
-1 != (i = (n = t.substring(r + 1, e)).indexOf("=")) ? s += null == (o = this._templateVars[n.substring(0, i)]) ? n.substring(i + 1) : o : null != (o = this._templateVars[n]) && (s += o);
r = e + 1;
} else {
s += t.substr(r, 2);
r = e + 1;
}
}
r < t.length && (s += t.substr(r));
return s;
};
Object.defineProperty(i.prototype, "templateVars", {
get: function() {
return this._templateVars;
},
set: function(t) {
if (null != this._templateVars || null != t) {
this._templateVars = t;
this.flushVars();
}
},
enumerable: !0,
configurable: !0
});
i.prototype.setVar = function(t, e) {
this._templateVars || (this._templateVars = {});
this._templateVars[t] = e;
return this;
};
i.prototype.flushVars = function() {
this.markSizeChanged();
this.updateText();
};
Object.defineProperty(i.prototype, "textWidth", {
get: function() {
this.ensureSizeCorrect();
return this._node.width;
},
enumerable: !0,
configurable: !0
});
i.prototype.ensureSizeCorrect = function() {
if (this._sizeDirty) {
this._label._updateRenderData(!0);
this._sizeDirty = !1;
}
};
i.prototype.updateText = function() {
var e = this._text;
null != this._templateVars && (e = this.parseTemplate(e));
this._ubbEnabled && (e = t.UBBParser.inst.parse(t.ToolSet.encodeHTML(e), !0));
this._label.string = e;
};
i.prototype.updateFont = function(e) {
if (e instanceof cc.Font) this._label.font = e; else {
var i = t.getFontByName(e);
if (i) this._label.font = i; else {
this._label.fontFamily = e;
this._label.isSystemFontUsed = !0;
}
}
};
i.prototype.updateFontColor = function() {
var e = this._color;
if (this._label) {
var i = this._label.font;
i instanceof cc.BitmapFont && !i._fntConfig.canTint && (e = cc.Color.WHITE);
}
this._grayed && (e = t.ToolSet.toGrayed(e));
this._node.color = e;
};
i.prototype.updateStrokeColor = function() {
this._outline && (this._grayed ? this._outline.color = t.ToolSet.toGrayed(this._strokeColor) : this._outline.color = this._strokeColor);
};
i.prototype.updateFontSize = function() {
var t = this._label.font;
if (t instanceof cc.BitmapFont) {
t._fntConfig.resizable ? this._label.fontSize = this._fontSize : this._label.fontSize = t._fntConfig.fontSize;
this._label.lineHeight = t._fntConfig.fontSize + this._leading + 4;
} else {
this._label.fontSize = this._fontSize;
this._label.lineHeight = this._fontSize + this._leading;
}
};
i.prototype.updateOverflow = function() {
if (this._autoSize == t.AutoSizeType.Both) this._label.overflow = cc.Label.Overflow.NONE; else if (this._autoSize == t.AutoSizeType.Height) {
this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
this._node.width = this._width;
} else if (this._autoSize == t.AutoSizeType.Shrink) {
this._label.overflow = cc.Label.Overflow.SHRINK;
this._node.setContentSize(this._width, this._height);
} else {
this._label.overflow = cc.Label.Overflow.CLAMP;
this._node.setContentSize(this._width, this._height);
}
};
i.prototype.markSizeChanged = function() {
if (!(this._underConstruct || this._autoSize != t.AutoSizeType.Both && this._autoSize != t.AutoSizeType.Height || this._sizeDirty)) {
this._node.emit(t.Event.SIZE_DELAY_CHANGE, this);
this._sizeDirty = !0;
}
};
i.prototype.onLabelSizeChanged = function() {
this._sizeDirty = !1;
if (!this._underConstruct && (this._autoSize == t.AutoSizeType.Both || this._autoSize == t.AutoSizeType.Height)) {
this._updatingSize = !0;
this.setSize(this._node.width, this._node.height);
this._updatingSize = !1;
}
};
i.prototype.handleSizeChanged = function() {
this._updatingSize || (this._autoSize == t.AutoSizeType.None || this._autoSize == t.AutoSizeType.Shrink ? this._node.setContentSize(this._width, this._height) : this._autoSize == t.AutoSizeType.Height && (this._node.width = this._width));
};
i.prototype.handleGrayedChanged = function() {
this.updateFontColor();
this.updateStrokeColor();
};
i.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 5);
this.font = t.readS();
this.fontSize = t.readShort();
this.color = t.readColor();
this.align = t.readByte();
this.verticalAlign = t.readByte();
this.leading = t.readShort();
this.letterSpacing = t.readShort();
this._ubbEnabled = t.readBool();
this.autoSize = t.readByte();
this.underline = t.readBool();
this.italic = t.readBool();
this.bold = t.readBool();
this.singleLine = t.readBool();
if (t.readBool()) {
this.strokeColor = t.readColor();
this.stroke = t.readFloat();
}
t.readBool() && t.skip(12);
t.readBool() && (this._templateVars = {});
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
t.seek(i, 6);
var n = t.readS();
null != n && (this.text = n);
};
return i;
}(t.GObject);
t.GTextField = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
return null !== e && e.apply(this, arguments) || this;
}
i.prototype.getSpriteFrame = function(i) {
var n = t.UIPackage.getItemByURL(i);
if (n) {
n.load();
if (n.type == t.PackageItemType.Image) return n.asset;
if (n.type == t.PackageItemType.MovieClip) return n.frames[0].texture;
}
return e.prototype.getSpriteFrame.call(this, i);
};
return i;
}(cc.SpriteAtlas);
t.RichTextImageAtlas = e;
var i = function(i) {
__extends(n, i);
function n() {
var e = i.call(this) || this;
e._node.name = "GRichTextField";
e._touchDisabled = !1;
e.linkUnderline = t.UIConfig.linkUnderline;
return e;
}
n.prototype.createRenderer = function() {
this._richText = this._node.addComponent(cc.RichText);
this._richText.handleTouchEvent = !1;
this.autoSize = t.AutoSizeType.None;
this._richText.imageAtlas = n.imageAtlas;
};
Object.defineProperty(n.prototype, "align", {
get: function() {
return this._richText.horizontalAlign;
},
set: function(t) {
this._richText.horizontalAlign = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "verticalAlign", {
get: function() {
return cc.Label.VerticalAlign.TOP;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "letterSpacing", {
get: function() {
return 0;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "underline", {
get: function() {
return this._underline;
},
set: function(t) {
if (this._underline != t) {
this._underline = t;
this.updateText();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "bold", {
get: function() {
return this._bold;
},
set: function(t) {
if (this._bold != t) {
this._bold = t;
this.updateText();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "italic", {
get: function() {
return this._italics;
},
set: function(t) {
if (this._italics != t) {
this._italics = t;
this.updateText();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "singleLine", {
get: function() {
return !1;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
n.prototype.markSizeChanged = function() {};
n.prototype.updateText = function() {
var e = this._text;
null != this._templateVars && (e = this.parseTemplate(e));
if (this._ubbEnabled) {
t.UBBParser.inst.linkUnderline = this.linkUnderline;
t.UBBParser.inst.linkColor = this.linkColor;
e = t.UBBParser.inst.parse(t.ToolSet.encodeHTML(e));
}
this._bold && (e = "<b>" + e + "</b>");
this._italics && (e = "<i>" + e + "</i>");
this._underline && (e = "<u>" + e + "</u>");
var i = this._color;
this._grayed && (i = t.ToolSet.toGrayed(i));
e = "<color=" + i.toHEX("#rrggbb") + ">" + e + "</color>";
if (this._autoSize == t.AutoSizeType.Both) {
0 != this._richText.maxWidth && (this._richText.maxWidth = 0);
this._richText.string = e;
0 != this.maxWidth && this._node.width > this.maxWidth && (this._richText.maxWidth = this.maxWidth);
} else this._richText.string = e;
};
n.prototype.updateFont = function(t) {
t instanceof cc.TTFFont ? this._richText.font = t : this._richText.font = null;
};
n.prototype.updateFontColor = function() {
this.updateText();
};
n.prototype.updateFontSize = function() {
var t = this._fontSize, e = this._richText.font;
e instanceof cc.BitmapFont && (e._fntConfig.resizable || (t = e._fntConfig.fontSize));
this._richText.fontSize = t;
this._richText.lineHeight = t + this._leading;
};
n.prototype.updateOverflow = function() {
this._autoSize == t.AutoSizeType.Both ? this._richText.maxWidth = 0 : this._richText.maxWidth = this._width;
};
n.prototype.handleSizeChanged = function() {
this._updatingSize || this._autoSize != t.AutoSizeType.Both && (this._richText.maxWidth = this._width);
};
n.imageAtlas = new e();
return n;
}(t.GTextField);
t.GRichTextField = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._node.name = "GRoot";
i.opaque = !1;
i._volumeScale = 1;
i._popupStack = new Array();
i._justClosedPopups = new Array();
i._modalLayer = new t.GGraph();
i._modalLayer.setSize(i.width, i.height);
i._modalLayer.drawRect(0, cc.Color.TRANSPARENT, t.UIConfig.modalLayerColor);
i._modalLayer.addRelation(i, t.RelationType.Size);
i._thisOnResized = i.onWinResize.bind(i);
i._inputProcessor = i.node.addComponent(t.InputProcessor);
i._inputProcessor._captureCallback = i.onTouchBegin_1;
cc.sys.isMobile ? window.addEventListener("resize", i._thisOnResized) : cc.view.on("canvas-resize", i._thisOnResized);
i.onWinResize();
return i;
}
Object.defineProperty(i, "inst", {
get: function() {
if (!i._inst) throw "Call GRoot.create first!";
return i._inst;
},
enumerable: !0,
configurable: !0
});
i.create = function() {
i._inst = new i();
i._inst.node.parent = cc.director.getScene();
return i._inst;
};
i.prototype.onDestroy = function() {
cc.sys.isMobile ? window.removeEventListener("resize", this._thisOnResized) : cc.view.off("canvas-resize", this._thisOnResized);
this == i._inst && (i._inst = null);
};
i.prototype.getTouchPosition = function(t) {
return this._inputProcessor.getTouchPosition(t);
};
Object.defineProperty(i.prototype, "touchTarget", {
get: function() {
return this._inputProcessor.getTouchTarget();
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "inputProcessor", {
get: function() {
return this._inputProcessor;
},
enumerable: !0,
configurable: !0
});
i.prototype.showWindow = function(t) {
this.addChild(t);
t.requestFocus();
t.x > this.width ? t.x = this.width - t.width : t.x + t.width < 0 && (t.x = 0);
t.y > this.height ? t.y = this.height - t.height : t.y + t.height < 0 && (t.y = 0);
this.adjustModalLayer();
};
i.prototype.hideWindow = function(t) {
t.hide();
};
i.prototype.hideWindowImmediately = function(t) {
t.parent == this && this.removeChild(t);
this.adjustModalLayer();
};
i.prototype.bringToFront = function(e) {
var i, n = this.numChildren;
i = null == this._modalLayer.parent || e.modal ? n - 1 : this.getChildIndex(this._modalLayer) - 1;
for (;i >= 0; i--) {
var o = this.getChildAt(i);
if (o == e) return;
if (o instanceof t.Window) break;
}
i >= 0 && this.setChildIndex(e, i);
};
i.prototype.showModalWait = function(e) {
if (null != t.UIConfig.globalModalWaiting) {
null == this._modalWaitPane && (this._modalWaitPane = t.UIPackage.createObjectFromURL(t.UIConfig.globalModalWaiting));
this._modalWaitPane.setSize(this.width, this.height);
this._modalWaitPane.addRelation(this, t.RelationType.Size);
this.addChild(this._modalWaitPane);
this._modalWaitPane.text = e;
}
};
i.prototype.closeModalWait = function() {
null != this._modalWaitPane && null != this._modalWaitPane.parent && this.removeChild(this._modalWaitPane);
};
i.prototype.closeAllExceptModals = function() {
for (var e = this._children.slice(), i = e.length, n = 0; n < i; n++) {
var o = e[n];
o instanceof t.Window && !o.modal && o.hide();
}
};
i.prototype.closeAllWindows = function() {
for (var e = this._children.slice(), i = e.length, n = 0; n < i; n++) {
var o = e[n];
o instanceof t.Window && o.hide();
}
};
i.prototype.getTopWindow = function() {
for (var e = this.numChildren - 1; e >= 0; e--) {
var i = this.getChildAt(e);
if (i instanceof t.Window) return i;
}
return null;
};
Object.defineProperty(i.prototype, "modalLayer", {
get: function() {
return this._modalLayer;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "hasModalWindow", {
get: function() {
return null != this._modalLayer.parent;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "modalWaiting", {
get: function() {
return this._modalWaitPane && this._modalWaitPane.node.activeInHierarchy;
},
enumerable: !0,
configurable: !0
});
i.prototype.getPopupPosition = function(t, e, i, n) {
var o = n || new cc.Vec2(), r = 0, s = 0;
if (e) {
o = e.localToGlobal();
var a = e.localToGlobal(e.width, e.height);
r = a.x - o.x;
s = a.y - o.y;
} else {
o = this.getTouchPosition();
o = this.globalToLocal(o.x, o.y);
}
o.x + t.width > this.width && (o.x = o.x + r - t.width);
o.y += s;
if (void 0 == i && o.y + t.height > this.height || 0 == i) {
o.y = o.y - s - t.height - 1;
if (o.y < 0) {
o.y = 0;
o.x += r / 2;
}
}
return o;
};
i.prototype.showPopup = function(t, e, i) {
if (this._popupStack.length > 0) {
var n = this._popupStack.indexOf(t);
if (-1 != n) for (var o = this._popupStack.length - 1; o >= n; o--) this.removeChild(this._popupStack.pop());
}
this._popupStack.push(t);
if (null != e) for (var r = e; null != r; ) {
if (r.parent == this) {
t.sortingOrder < r.sortingOrder && (t.sortingOrder = r.sortingOrder);
break;
}
r = r.parent;
}
this.addChild(t);
this.adjustModalLayer();
var s = this.getPopupPosition(t, e, i);
t.setPosition(s.x, s.y);
};
i.prototype.togglePopup = function(t, e, i) {
-1 == this._justClosedPopups.indexOf(t) && this.showPopup(t, e, i);
};
i.prototype.hidePopup = function(t) {
if (null != t) {
var e = this._popupStack.indexOf(t);
if (-1 != e) for (var i = this._popupStack.length - 1; i >= e; i--) this.closePopup(this._popupStack.pop());
} else {
for (i = this._popupStack.length - 1; i >= 0; i--) this.closePopup(this._popupStack[i]);
this._popupStack.length = 0;
}
};
Object.defineProperty(i.prototype, "hasAnyPopup", {
get: function() {
return 0 != this._popupStack.length;
},
enumerable: !0,
configurable: !0
});
i.prototype.closePopup = function(e) {
null != e.parent && (e instanceof t.Window ? e.hide() : this.removeChild(e));
};
i.prototype.showTooltips = function(e) {
if (null == this._defaultTooltipWin) {
var i = t.UIConfig.tooltipsWin;
if (!i) {
console.error("UIConfig.tooltipsWin not defined");
return;
}
this._defaultTooltipWin = t.UIPackage.createObjectFromURL(i);
}
this._defaultTooltipWin.text = e;
this.showTooltipsWin(this._defaultTooltipWin);
};
i.prototype.showTooltipsWin = function(t) {
this.hideTooltips();
this._tooltipWin = t;
var e = this.getTouchPosition();
e.x += 10;
e.y += 20;
this.globalToLocal(e.x, e.y, e);
if (e.x + this._tooltipWin.width > this.width) {
e.x = e.x - this._tooltipWin.width - 1;
e.x < 0 && (e.x = 10);
}
if (e.y + this._tooltipWin.height > this.height) {
e.y = e.y - this._tooltipWin.height - 1;
e.y < 0 && (e.y = 10);
}
this._tooltipWin.setPosition(e.x, e.y);
this.addChild(this._tooltipWin);
};
i.prototype.hideTooltips = function() {
if (null != this._tooltipWin) {
this._tooltipWin.parent && this.removeChild(this._tooltipWin);
this._tooltipWin = null;
}
};
Object.defineProperty(i.prototype, "volumeScale", {
get: function() {
return this._volumeScale;
},
set: function(t) {
this._volumeScale = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.playOneShotSound = function(t, e) {
void 0 === e && (e = 1);
cc.audioEngine.play(t, !1, this._volumeScale * e);
};
i.prototype.adjustModalLayer = function() {
var e = this.numChildren;
null != this._modalWaitPane && null != this._modalWaitPane.parent && this.setChildIndex(this._modalWaitPane, e - 1);
for (var i = e - 1; i >= 0; i--) {
var n = this.getChildAt(i);
if (n instanceof t.Window && n.modal) {
null == this._modalLayer.parent ? this.addChildAt(this._modalLayer, i) : this.setChildIndexBefore(this._modalLayer, i);
return;
}
}
null != this._modalLayer.parent && this.removeChild(this._modalLayer);
};
i.prototype.onTouchBegin_1 = function(t) {
null != this._tooltipWin && this.hideTooltips();
this._justClosedPopups.length = 0;
if (this._popupStack.length > 0) {
for (var e = t.initiator; e != this && null != e; ) {
var i = this._popupStack.indexOf(e);
if (-1 != i) {
for (var n = this._popupStack.length - 1; n > i; n--) {
var o = this._popupStack.pop();
this.closePopup(o);
this._justClosedPopups.push(o);
}
return;
}
e = e.findParent();
}
for (n = this._popupStack.length - 1; n >= 0; n--) {
o = this._popupStack[n];
this.closePopup(o);
this._justClosedPopups.push(o);
}
this._popupStack.length = 0;
}
};
i.prototype.onWinResize = function() {
var t = cc.view.getCanvasSize();
t.width /= cc.view.getScaleX();
t.height /= cc.view.getScaleY();
var e = cc.view.getViewportRect().origin;
e.x = e.x / cc.view.getScaleX();
e.y = e.y / cc.view.getScaleY();
this.setSize(t.width, t.height);
this._node.setPosition(-e.x, this._height - e.y);
};
i.prototype.handlePositionChanged = function() {};
return i;
}(t.GComponent);
t.GRoot = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var t = e.call(this) || this;
t._node.name = "GScrollBar";
t._dragOffset = new cc.Vec2();
t._scrollPerc = 0;
return t;
}
i.prototype.setScrollPane = function(t, e) {
this._target = t;
this._vertical = e;
};
Object.defineProperty(i.prototype, "displayPerc", {
set: function(t) {
if (this._vertical) {
this._fixedGripSize || (this._grip.height = t * this._bar.height);
this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
} else {
this._fixedGripSize || (this._grip.width = t * this._bar.width);
this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "scrollPerc", {
set: function(t) {
this._scrollPerc = t;
this._vertical ? this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc : this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "minSize", {
get: function() {
return this._vertical ? (null != this._arrowButton1 ? this._arrowButton1.height : 0) + (null != this._arrowButton2 ? this._arrowButton2.height : 0) : (null != this._arrowButton1 ? this._arrowButton1.width : 0) + (null != this._arrowButton2 ? this._arrowButton2.width : 0);
},
enumerable: !0,
configurable: !0
});
i.prototype.constructExtension = function(e) {
e.seek(0, 6);
this._fixedGripSize = e.readBool();
this._grip = this.getChild("grip");
if (this._grip) {
this._bar = this.getChild("bar");
if (this._bar) {
this._arrowButton1 = this.getChild("arrow1");
this._arrowButton2 = this.getChild("arrow2");
this._grip.on(t.Event.TOUCH_BEGIN, this.onGripTouchDown, this);
this._grip.on(t.Event.TOUCH_MOVE, this.onGripTouchMove, this);
this._arrowButton1 && this._arrowButton1.on(t.Event.TOUCH_BEGIN, this.onClickArrow1, this);
this._arrowButton2 && this._arrowButton2.on(t.Event.TOUCH_BEGIN, this.onClickArrow2, this);
this.on(t.Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
} else console.error("需要定义bar");
} else console.error("需要定义grip");
};
i.prototype.onGripTouchDown = function(t) {
if (this._bar) {
t.stopPropagation();
t.captureTouch();
this.globalToLocal(t.pos.x, t.pos.y, this._dragOffset);
this._dragOffset.x -= this._grip.x;
this._dragOffset.y -= this._grip.y;
}
};
i.prototype.onGripTouchMove = function(t) {
if (this.onStage) {
var e = this.globalToLocal(t.pos.x, t.pos.y, i.sScrollbarHelperPoint);
if (this._vertical) {
var n = e.y - this._dragOffset.y;
this._target.setPercY((n - this._bar.y) / (this._bar.height - this._grip.height), !1);
} else {
var o = e.x - this._dragOffset.x;
this._target.setPercX((o - this._bar.x) / (this._bar.width - this._grip.width), !1);
}
}
};
i.prototype.onClickArrow1 = function(t) {
t.stopPropagation();
this._vertical ? this._target.scrollUp() : this._target.scrollLeft();
};
i.prototype.onClickArrow2 = function(t) {
t.stopPropagation();
this._vertical ? this._target.scrollDown() : this._target.scrollRight();
};
i.prototype.onBarTouchBegin = function(t) {
var e = this._grip.globalToLocal(t.pos.x, t.pos.y, i.sScrollbarHelperPoint);
this._vertical ? e.y < 0 ? this._target.scrollUp(4) : this._target.scrollDown(4) : e.x < 0 ? this._target.scrollLeft(4) : this._target.scrollRight(4);
};
i.sScrollbarHelperPoint = new cc.Vec2();
return i;
}(t.GComponent);
t.GScrollBar = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._max = 0;
i._value = 0;
i._reverse = !1;
i._barMaxWidth = 0;
i._barMaxHeight = 0;
i._barMaxWidthDelta = 0;
i._barMaxHeightDelta = 0;
i._clickPercent = 0;
i._barStartX = 0;
i._barStartY = 0;
i.changeOnClick = !0;
i.canDrag = !0;
i._node.name = "GSlider";
i._titleType = t.ProgressTitleType.Percent;
i._value = 50;
i._max = 100;
i._clickPos = new cc.Vec2();
return i;
}
Object.defineProperty(i.prototype, "titleType", {
get: function() {
return this._titleType;
},
set: function(t) {
this._titleType = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "max", {
get: function() {
return this._max;
},
set: function(t) {
if (this._max != t) {
this._max = t;
this.update();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "value", {
get: function() {
return this._value;
},
set: function(t) {
if (this._value != t) {
this._value = t;
this.update();
}
},
enumerable: !0,
configurable: !0
});
i.prototype.update = function() {
var t = Math.min(this._value / this._max, 1);
this.updateWidthPercent(t);
};
i.prototype.updateWidthPercent = function(e) {
if (this._titleObject) switch (this._titleType) {
case t.ProgressTitleType.Percent:
this._titleObject.text = Math.round(100 * e) + "%";
break;

case t.ProgressTitleType.ValueAndMax:
this._titleObject.text = this._value + "/" + this._max;
break;

case t.ProgressTitleType.Value:
this._titleObject.text = "" + this._value;
break;

case t.ProgressTitleType.Max:
this._titleObject.text = "" + this._max;
}
var i = this.width - this._barMaxWidthDelta, n = this.height - this._barMaxHeightDelta;
if (this._reverse) {
if (this._barObjectH) {
this._barObjectH.width = Math.round(i * e);
this._barObjectH.x = this._barStartX + (i - this._barObjectH.width);
}
if (this._barObjectV) {
this._barObjectV.height = Math.round(n * e);
this._barObjectV.y = this._barStartY + (n - this._barObjectV.height);
}
} else {
this._barObjectH && (this._barObjectH.width = Math.round(i * e));
this._barObjectV && (this._barObjectV.height = Math.round(n * e));
}
};
i.prototype.constructExtension = function(e) {
e.seek(0, 6);
this._titleType = e.readByte();
this._reverse = e.readBool();
this._titleObject = this.getChild("title");
this._barObjectH = this.getChild("bar");
this._barObjectV = this.getChild("bar_v");
this._gripObject = this.getChild("grip");
if (this._barObjectH) {
this._barMaxWidth = this._barObjectH.width;
this._barMaxWidthDelta = this.width - this._barMaxWidth;
this._barStartX = this._barObjectH.x;
}
if (this._barObjectV) {
this._barMaxHeight = this._barObjectV.height;
this._barMaxHeightDelta = this.height - this._barMaxHeight;
this._barStartY = this._barObjectV.y;
}
if (this._gripObject) {
this._gripObject.on(t.Event.TOUCH_BEGIN, this.onGripTouchBegin, this);
this._gripObject.on(t.Event.TOUCH_MOVE, this.onGripTouchMove, this);
}
this._node.on(t.Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
};
i.prototype.handleSizeChanged = function() {
e.prototype.handleSizeChanged.call(this);
this._barObjectH && (this._barMaxWidth = this.width - this._barMaxWidthDelta);
this._barObjectV && (this._barMaxHeight = this.height - this._barMaxHeightDelta);
this._underConstruct || this.update();
};
i.prototype.setup_afterAdd = function(t, i) {
e.prototype.setup_afterAdd.call(this, t, i);
if (t.seek(i, 6)) if (t.readByte() == this.packageItem.objectType) {
this._value = t.readInt();
this._max = t.readInt();
this.update();
} else this.update(); else this.update();
};
i.prototype.onGripTouchBegin = function(t) {
this.canDrag = !0;
t.stopPropagation();
t.captureTouch();
this._clickPos = this.globalToLocal(t.pos.x, t.pos.y);
this._clickPercent = this._value / this._max;
};
i.prototype.onGripTouchMove = function(e) {
if (this.canDrag) {
var n, o = this.globalToLocal(e.pos.x, e.pos.y, i.sSilderHelperPoint), r = o.x - this._clickPos.x, s = o.y - this._clickPos.y;
if (this._reverse) {
r = -r;
s = -s;
}
(n = this._barObjectH ? this._clickPercent + r / this._barMaxWidth : this._clickPercent + s / this._barMaxHeight) > 1 ? n = 1 : n < 0 && (n = 0);
var a = Math.round(this._max * n);
if (a != this._value) {
this._value = a;
this._node.emit(t.Event.STATUS_CHANGED, this);
}
this.updateWidthPercent(n);
}
};
i.prototype.onBarTouchBegin = function(e) {
if (this.changeOnClick) {
var n, o = this._gripObject.globalToLocal(e.pos.x, e.pos.y, i.sSilderHelperPoint), r = this._value / this._max;
this._barObjectH && (n = (o.x - this._gripObject.width / 2) / this._barMaxWidth);
this._barObjectV && (n = (o.y - this._gripObject.height / 2) / this._barMaxHeight);
this._reverse ? r -= n : r += n;
r > 1 ? r = 1 : r < 0 && (r = 0);
var s = Math.round(this._max * r);
if (s != this._value) {
this._value = s;
this._node.emit(t.Event.STATUS_CHANGED, this);
}
this.updateWidthPercent(r);
}
};
i.sSilderHelperPoint = new cc.Vec2();
return i;
}(t.GComponent);
t.GSlider = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(n, e);
function n() {
var t = e.call(this) || this;
t._node.name = "GTextInput";
t._touchDisabled = !1;
return t;
}
n.prototype.createRenderer = function() {
this._editBox = this._node.addComponent(i);
this._editBox.placeholder = "";
this._editBox.maxLength = -1;
this._node.on("text-changed", this.onTextChanged, this);
this.on(t.Event.TOUCH_END, this.onTouchEnd1, this);
this.autoSize = t.AutoSizeType.None;
};
Object.defineProperty(n.prototype, "editable", {
get: function() {
return this._editBox.enabled;
},
set: function(t) {
this._editBox.enabled = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "maxLength", {
get: function() {
return this._editBox.maxLength;
},
set: function(t) {
0 == t && (t = -1);
this._editBox.maxLength = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "promptText", {
get: function() {
return this._promptText;
},
set: function(e) {
this._promptText = e;
this._editBox.placeholder = t.UBBParser.inst.parse(this._promptText, !0);
if (t.UBBParser.inst.lastColor) {
var i = this._editBox.placeholderFontColor;
i || (i = new cc.Color());
i.fromHEX(t.UBBParser.inst.lastColor);
this._editBox.placeholderFontColor = i;
}
t.UBBParser.inst.lastSize && (this._editBox.placeholderFontSize = parseInt(t.UBBParser.inst.lastSize));
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "restrict", {
get: function() {
return "";
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "password", {
get: function() {
return this._editBox.inputFlag == cc.EditBox.InputFlag.PASSWORD;
},
set: function(t) {
this._editBox.inputFlag = t ? cc.EditBox.InputFlag.PASSWORD : cc.EditBox.InputFlag.DEFAULT;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "align", {
get: function() {
return cc.Label.HorizontalAlign.LEFT;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "verticalAlign", {
get: function() {
return cc.Label.VerticalAlign.TOP;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "letterSpacing", {
get: function() {
return 0;
},
set: function(t) {},
enumerable: !0,
configurable: !0
});
Object.defineProperty(n.prototype, "singleLine", {
get: function() {
return this._editBox.inputMode != cc.EditBox.InputMode.ANY;
},
set: function(t) {
this._editBox.inputMode = t ? cc.EditBox.InputMode.SINGLE_LINE : cc.EditBox.InputMode.ANY;
},
enumerable: !0,
configurable: !0
});
n.prototype.requestFocus = function() {
this._editBox.setFocus();
};
n.prototype.markSizeChanged = function() {};
n.prototype.updateText = function() {
var e = this._text;
null != this._templateVars && (e = this.parseTemplate(e));
this._ubbEnabled && (e = t.UBBParser.inst.parse(t.ToolSet.encodeHTML(e), !0));
this._editBox.string = e;
};
n.prototype.updateFont = function(t) {};
n.prototype.updateFontColor = function() {
this._editBox.fontColor = this._color;
};
n.prototype.updateFontSize = function() {
this._editBox.fontSize = this._fontSize;
this._editBox.lineHeight = this._fontSize + this._leading;
};
n.prototype.updateOverflow = function() {};
n.prototype.onTextChanged = function() {
this._text = this._editBox.string;
};
n.prototype.onTouchEnd1 = function(t) {
this._editBox.openKeyboard(t.touch);
};
n.prototype.setup_beforeAdd = function(t, i) {
e.prototype.setup_beforeAdd.call(this, t, i);
t.seek(i, 4);
var n = t.readS();
null != n && (this.promptText = n);
null != (n = t.readS()) && (this.restrict = n);
var o = t.readInt();
0 != o && (this.maxLength = o);
o = t.readInt();
t.readBool() && (this.password = !0);
};
return n;
}(t.GTextField);
t.GTextInput = e;
var i = function(t) {
__extends(e, t);
function e() {
return null !== t && t.apply(this, arguments) || this;
}
e.prototype._registerEvent = function() {};
e.prototype.openKeyboard = function(t) {
var e = this._impl;
e && e._onTouchEnded(t);
};
return e;
}(cc.EditBox);
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {
this.left = 0;
this.right = 0;
this.top = 0;
this.bottom = 0;
}
t.prototype.copy = function(t) {
this.top = t.top;
this.bottom = t.bottom;
this.left = t.left;
this.right = t.right;
};
t.prototype.isNone = function() {
return 0 == this.left && 0 == this.right && 0 == this.top && 0 == this.bottom;
};
return t;
}();
t.Margin = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {
this.width = 0;
this.height = 0;
this.tileGridIndice = 0;
this.interval = 0;
this.repeatDelay = 0;
}
t.prototype.load = function() {
return this.owner.getItemAsset(this);
};
t.prototype.toString = function() {
return this.name;
};
return t;
}();
t.PackageItem = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(e) {
void 0 === e && (e = null);
if (!e && !(e = t.UIConfig.popupMenu)) throw "UIConfig.popupMenu not defined";
this._contentPane = t.UIPackage.createObjectFromURL(e).asCom;
this._contentPane.on(t.Event.DISPLAY, this.onDisplay, this);
this._list = this._contentPane.getChild("list");
this._list.removeChildrenToPool();
this._list.addRelation(this._contentPane, t.RelationType.Width);
this._list.removeRelation(this._contentPane, t.RelationType.Height);
this._contentPane.addRelation(this._list, t.RelationType.Height);
this._list.on(t.Event.CLICK_ITEM, this.onClickItem, this);
}
e.prototype.dispose = function() {
this._contentPane.dispose();
};
e.prototype.addItem = function(t, e) {
var i = this._list.addItemFromPool().asButton;
i.title = t;
i.data = e;
i.grayed = !1;
var n = i.getController("checked");
null != n && (n.selectedIndex = 0);
return i;
};
e.prototype.addItemAt = function(t, e, i) {
var n = this._list.getFromPool().asButton;
this._list.addChildAt(n, e);
n.title = t;
n.data = i;
n.grayed = !1;
var o = n.getController("checked");
null != o && (o.selectedIndex = 0);
return n;
};
e.prototype.addSeperator = function() {
if (null == t.UIConfig.popupMenu_seperator) throw "UIConfig.popupMenu_seperator not defined";
this.list.addItemFromPool(t.UIConfig.popupMenu_seperator);
};
e.prototype.getItemName = function(t) {
return this._list.getChildAt(t).name;
};
e.prototype.setItemText = function(t, e) {
this._list.getChild(t).asButton.title = e;
};
e.prototype.setItemVisible = function(t, e) {
var i = this._list.getChild(t).asButton;
if (i.visible != e) {
i.visible = e;
this._list.setBoundsChangedFlag();
}
};
e.prototype.setItemGrayed = function(t, e) {
this._list.getChild(t).asButton.grayed = e;
};
e.prototype.setItemCheckable = function(t, e) {
var i = this._list.getChild(t).asButton.getController("checked");
null != i && (e ? 0 == i.selectedIndex && (i.selectedIndex = 1) : i.selectedIndex = 0);
};
e.prototype.setItemChecked = function(t, e) {
var i = this._list.getChild(t).asButton.getController("checked");
null != i && (i.selectedIndex = e ? 2 : 1);
};
e.prototype.isItemChecked = function(t) {
var e = this._list.getChild(t).asButton.getController("checked");
return null != e && 2 == e.selectedIndex;
};
e.prototype.removeItem = function(t) {
var e = this._list.getChild(t);
if (null != e) {
var i = this._list.getChildIndex(e);
this._list.removeChildToPoolAt(i);
return !0;
}
return !1;
};
e.prototype.clearItems = function() {
this._list.removeChildrenToPool();
};
Object.defineProperty(e.prototype, "itemCount", {
get: function() {
return this._list.numChildren;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "contentPane", {
get: function() {
return this._contentPane;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "list", {
get: function() {
return this._list;
},
enumerable: !0,
configurable: !0
});
e.prototype.show = function(e, i) {
void 0 === e && (e = null);
(null != e ? e.root : t.GRoot.inst).showPopup(this.contentPane, e instanceof t.GRoot ? null : e, i);
};
e.prototype.onClickItem = function(t, e) {
var i = this;
this._list._partner.callLater(function(n) {
i.onClickItem2(t, e);
}, .1);
};
e.prototype.onClickItem2 = function(t, e) {
var i = t.asButton;
if (null != i) if (i.grayed) this._list.selectedIndex = -1; else {
var n = i.getController("checked");
null != n && 0 != n.selectedIndex && (1 == n.selectedIndex ? n.selectedIndex = 2 : n.selectedIndex = 1);
this._contentPane.parent.hidePopup(this.contentPane);
i.data instanceof Function && i.data(i, e);
}
};
e.prototype.onDisplay = function() {
this._list.selectedIndex = -1;
this._list.resizeToFit(1e5, 10);
};
return e;
}();
t.PopupMenu = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(t) {
this._owner = t;
this._defs = new Array();
}
Object.defineProperty(e.prototype, "owner", {
get: function() {
return this._owner;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "target", {
get: function() {
return this._target;
},
set: function(t) {
if (this._target != t) {
this._target && this.releaseRefTarget(this._target);
this._target = t;
this._target && this.addRefTarget(this._target);
}
},
enumerable: !0,
configurable: !0
});
e.prototype.add = function(e, i) {
if (e != t.RelationType.Size) {
for (var n = this._defs.length, o = 0; o < n; o++) {
if (this._defs[o].type == e) return;
}
this.internalAdd(e, i);
} else {
this.add(t.RelationType.Width, i);
this.add(t.RelationType.Height, i);
}
};
e.prototype.internalAdd = function(e, n) {
if (e != t.RelationType.Size) {
var o = new i();
o.percent = n;
o.type = e;
o.axis = e <= t.RelationType.Right_Right || e == t.RelationType.Width || e >= t.RelationType.LeftExt_Left && e <= t.RelationType.RightExt_Right ? 0 : 1;
this._defs.push(o);
(n || e == t.RelationType.Left_Center || e == t.RelationType.Center_Center || e == t.RelationType.Right_Center || e == t.RelationType.Top_Middle || e == t.RelationType.Middle_Middle || e == t.RelationType.Bottom_Middle) && (this._owner.pixelSnapping = !0);
} else {
this.internalAdd(t.RelationType.Width, n);
this.internalAdd(t.RelationType.Height, n);
}
};
e.prototype.remove = function(e) {
if (e != t.RelationType.Size) {
for (var i = this._defs.length, n = 0; n < i; n++) if (this._defs[n].type == e) {
this._defs.splice(n, 1);
break;
}
} else {
this.remove(t.RelationType.Width);
this.remove(t.RelationType.Height);
}
};
e.prototype.copyFrom = function(t) {
this.target = t.target;
this._defs.length = 0;
for (var e = t._defs.length, n = 0; n < e; n++) {
var o = t._defs[n], r = new i();
r.copyFrom(o);
this._defs.push(r);
}
};
e.prototype.dispose = function() {
if (null != this._target) {
this.releaseRefTarget(this._target);
this._target = null;
}
};
Object.defineProperty(e.prototype, "isEmpty", {
get: function() {
return 0 == this._defs.length;
},
enumerable: !0,
configurable: !0
});
e.prototype.applyOnSelfResized = function(e, i, n) {
for (var o = this._owner.x, r = this._owner.y, s = this._defs.length, a = 0; a < s; a++) {
switch (this._defs[a].type) {
case t.RelationType.Center_Center:
this._owner.x -= (.5 - (n ? this._owner.pivotX : 0)) * e;
break;

case t.RelationType.Right_Center:
case t.RelationType.Right_Left:
case t.RelationType.Right_Right:
this._owner.x -= (1 - (n ? this._owner.pivotX : 0)) * e;
break;

case t.RelationType.Middle_Middle:
this._owner.y -= (.5 - (n ? this._owner.pivotY : 0)) * i;
break;

case t.RelationType.Bottom_Middle:
case t.RelationType.Bottom_Top:
case t.RelationType.Bottom_Bottom:
this._owner.y -= (1 - (n ? this._owner.pivotY : 0)) * i;
}
}
if (o != this._owner.x || r != this._owner.y) {
o = this._owner.x - o;
r = this._owner.y - r;
this._owner.updateGearFromRelations(1, o, r);
if (null != this._owner.parent) {
var h = this._owner.parent._transitions.length;
if (h > 0) for (a = 0; a < h; ++a) this._owner.parent._transitions[a].updateFromRelations(this._owner.id, o, r);
}
}
};
e.prototype.applyOnXYChanged = function(e, i, n) {
var o;
switch (e.type) {
case t.RelationType.Left_Left:
case t.RelationType.Left_Center:
case t.RelationType.Left_Right:
case t.RelationType.Center_Center:
case t.RelationType.Right_Left:
case t.RelationType.Right_Center:
case t.RelationType.Right_Right:
this._owner.x += i;
break;

case t.RelationType.Top_Top:
case t.RelationType.Top_Middle:
case t.RelationType.Top_Bottom:
case t.RelationType.Middle_Middle:
case t.RelationType.Bottom_Top:
case t.RelationType.Bottom_Middle:
case t.RelationType.Bottom_Bottom:
this._owner.y += n;
break;

case t.RelationType.Width:
case t.RelationType.Height:
break;

case t.RelationType.LeftExt_Left:
case t.RelationType.LeftExt_Right:
o = this._owner.xMin;
this._owner.width = this._owner._rawWidth - i;
this._owner.xMin = o + i;
break;

case t.RelationType.RightExt_Left:
case t.RelationType.RightExt_Right:
o = this._owner.xMin;
this._owner.width = this._owner._rawWidth + i;
this._owner.xMin = o;
break;

case t.RelationType.TopExt_Top:
case t.RelationType.TopExt_Bottom:
o = this._owner.yMin;
this._owner.height = this._owner._rawHeight - n;
this._owner.yMin = o + n;
break;

case t.RelationType.BottomExt_Top:
case t.RelationType.BottomExt_Bottom:
o = this._owner.yMin;
this._owner.height = this._owner._rawHeight + n;
this._owner.yMin = o;
}
};
e.prototype.applyOnSizeChanged = function(e) {
var i, n, o = 0, r = 0, s = 0;
if (0 == e.axis) {
if (this._target != this._owner.parent) {
o = this._target.x;
this._target.pivotAsAnchor && (r = this._target.pivotX);
}
e.percent ? 0 != this._targetWidth && (s = this._target._width / this._targetWidth) : s = this._target._width - this._targetWidth;
} else {
if (this._target != this._owner.parent) {
o = this._target.y;
this._target.pivotAsAnchor && (r = this._target.pivotY);
}
e.percent ? 0 != this._targetHeight && (s = this._target._height / this._targetHeight) : s = this._target._height - this._targetHeight;
}
switch (e.type) {
case t.RelationType.Left_Left:
e.percent ? this._owner.xMin = o + (this._owner.xMin - o) * s : 0 != r && (this._owner.x += s * -r);
break;

case t.RelationType.Left_Center:
e.percent ? this._owner.xMin = o + (this._owner.xMin - o) * s : this._owner.x += s * (.5 - r);
break;

case t.RelationType.Left_Right:
e.percent ? this._owner.xMin = o + (this._owner.xMin - o) * s : this._owner.x += s * (1 - r);
break;

case t.RelationType.Center_Center:
e.percent ? this._owner.xMin = o + (this._owner.xMin + .5 * this._owner._rawWidth - o) * s - .5 * this._owner._rawWidth : this._owner.x += s * (.5 - r);
break;

case t.RelationType.Right_Left:
e.percent ? this._owner.xMin = o + (this._owner.xMin + this._owner._rawWidth - o) * s - this._owner._rawWidth : 0 != r && (this._owner.x += s * -r);
break;

case t.RelationType.Right_Center:
e.percent ? this._owner.xMin = o + (this._owner.xMin + this._owner._rawWidth - o) * s - this._owner._rawWidth : this._owner.x += s * (.5 - r);
break;

case t.RelationType.Right_Right:
e.percent ? this._owner.xMin = o + (this._owner.xMin + this._owner._rawWidth - o) * s - this._owner._rawWidth : this._owner.x += s * (1 - r);
break;

case t.RelationType.Top_Top:
e.percent ? this._owner.yMin = o + (this._owner.yMin - o) * s : 0 != r && (this._owner.y += s * -r);
break;

case t.RelationType.Top_Middle:
e.percent ? this._owner.yMin = o + (this._owner.yMin - o) * s : this._owner.y += s * (.5 - r);
break;

case t.RelationType.Top_Bottom:
e.percent ? this._owner.yMin = o + (this._owner.yMin - o) * s : this._owner.y += s * (1 - r);
break;

case t.RelationType.Middle_Middle:
e.percent ? this._owner.yMin = o + (this._owner.yMin + .5 * this._owner._rawHeight - o) * s - .5 * this._owner._rawHeight : this._owner.y += s * (.5 - r);
break;

case t.RelationType.Bottom_Top:
e.percent ? this._owner.yMin = o + (this._owner.yMin + this._owner._rawHeight - o) * s - this._owner._rawHeight : 0 != r && (this._owner.y += s * -r);
break;

case t.RelationType.Bottom_Middle:
e.percent ? this._owner.yMin = o + (this._owner.yMin + this._owner._rawHeight - o) * s - this._owner._rawHeight : this._owner.y += s * (.5 - r);
break;

case t.RelationType.Bottom_Bottom:
e.percent ? this._owner.yMin = o + (this._owner.yMin + this._owner._rawHeight - o) * s - this._owner._rawHeight : this._owner.y += s * (1 - r);
break;

case t.RelationType.Width:
i = this._owner._underConstruct && this._owner == this._target.parent ? this._owner.sourceWidth - this._target.initWidth : this._owner._rawWidth - this._targetWidth;
e.percent && (i *= s);
if (this._target == this._owner.parent) if (this._owner.pivotAsAnchor) {
n = this._owner.xMin;
this._owner.setSize(this._target._width + i, this._owner._rawHeight, !0);
this._owner.xMin = n;
} else this._owner.setSize(this._target._width + i, this._owner._rawHeight, !0); else this._owner.width = this._target._width + i;
break;

case t.RelationType.Height:
i = this._owner._underConstruct && this._owner == this._target.parent ? this._owner.sourceHeight - this._target.initHeight : this._owner._rawHeight - this._targetHeight;
e.percent && (i *= s);
if (this._target == this._owner.parent) if (this._owner.pivotAsAnchor) {
n = this._owner.yMin;
this._owner.setSize(this._owner._rawWidth, this._target._height + i, !0);
this._owner.yMin = n;
} else this._owner.setSize(this._owner._rawWidth, this._target._height + i, !0); else this._owner.height = this._target._height + i;
break;

case t.RelationType.LeftExt_Left:
n = this._owner.xMin;
i = e.percent ? o + (n - o) * s - n : s * -r;
this._owner.width = this._owner._rawWidth - i;
this._owner.xMin = n + i;
break;

case t.RelationType.LeftExt_Right:
n = this._owner.xMin;
i = e.percent ? o + (n - o) * s - n : s * (1 - r);
this._owner.width = this._owner._rawWidth - i;
this._owner.xMin = n + i;
break;

case t.RelationType.RightExt_Left:
n = this._owner.xMin;
i = e.percent ? o + (n + this._owner._rawWidth - o) * s - (n + this._owner._rawWidth) : s * -r;
this._owner.width = this._owner._rawWidth + i;
this._owner.xMin = n;
break;

case t.RelationType.RightExt_Right:
n = this._owner.xMin;
if (e.percent) if (this._owner == this._target.parent) this._owner._underConstruct ? this._owner.width = o + this._target._width - this._target._width * r + (this._owner.sourceWidth - o - this._target.initWidth + this._target.initWidth * r) * s : this._owner.width = o + (this._owner._rawWidth - o) * s; else {
i = o + (n + this._owner._rawWidth - o) * s - (n + this._owner._rawWidth);
this._owner.width = this._owner._rawWidth + i;
this._owner.xMin = n;
} else if (this._owner == this._target.parent) this._owner._underConstruct ? this._owner.width = this._owner.sourceWidth + (this._target._width - this._target.initWidth) * (1 - r) : this._owner.width = this._owner._rawWidth + s * (1 - r); else {
i = s * (1 - r);
this._owner.width = this._owner._rawWidth + i;
this._owner.xMin = n;
}
break;

case t.RelationType.TopExt_Top:
n = this._owner.yMin;
i = e.percent ? o + (n - o) * s - n : s * -r;
this._owner.height = this._owner._rawHeight - i;
this._owner.yMin = n + i;
break;

case t.RelationType.TopExt_Bottom:
n = this._owner.yMin;
i = e.percent ? o + (n - o) * s - n : s * (1 - r);
this._owner.height = this._owner._rawHeight - i;
this._owner.yMin = n + i;
break;

case t.RelationType.BottomExt_Top:
n = this._owner.yMin;
i = e.percent ? o + (n + this._owner._rawHeight - o) * s - (n + this._owner._rawHeight) : s * -r;
this._owner.height = this._owner._rawHeight + i;
this._owner.yMin = n;
break;

case t.RelationType.BottomExt_Bottom:
n = this._owner.yMin;
if (e.percent) if (this._owner == this._target.parent) this._owner._underConstruct ? this._owner.height = o + this._target._height - this._target._height * r + (this._owner.sourceHeight - o - this._target.initHeight + this._target.initHeight * r) * s : this._owner.height = o + (this._owner._rawHeight - o) * s; else {
i = o + (n + this._owner._rawHeight - o) * s - (n + this._owner._rawHeight);
this._owner.height = this._owner._rawHeight + i;
this._owner.yMin = n;
} else if (this._owner == this._target.parent) this._owner._underConstruct ? this._owner.height = this._owner.sourceHeight + (this._target._height - this._target.initHeight) * (1 - r) : this._owner.height = this._owner._rawHeight + s * (1 - r); else {
i = s * (1 - r);
this._owner.height = this._owner._rawHeight + i;
this._owner.yMin = n;
}
}
};
e.prototype.addRefTarget = function(e) {
e != this._owner.parent && e.on(t.Event.XY_CHANGED, this.__targetXYChanged, this);
e.on(t.Event.SIZE_CHANGED, this.__targetSizeChanged, this);
e.on(t.Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
this._targetX = this._target.x;
this._targetY = this._target.y;
this._targetWidth = this._target._width;
this._targetHeight = this._target._height;
};
e.prototype.releaseRefTarget = function(e) {
if (e.node) {
e.off(t.Event.XY_CHANGED, this.__targetXYChanged, this);
e.off(t.Event.SIZE_CHANGED, this.__targetSizeChanged, this);
e.off(t.Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
}
};
e.prototype.__targetXYChanged = function(t) {
if (null != this._owner.relations.handling || null != this._owner.group && this._owner.group._updating) {
this._targetX = this._target.x;
this._targetY = this._target.y;
} else {
this._owner.relations.handling = this._target;
for (var e = this._owner.x, i = this._owner.y, n = this._target.x - this._targetX, o = this._target.y - this._targetY, r = this._defs.length, s = 0; s < r; s++) {
var a = this._defs[s];
this.applyOnXYChanged(a, n, o);
}
this._targetX = this._target.x;
this._targetY = this._target.y;
if (e != this._owner.x || i != this._owner.y) {
e = this._owner.x - e;
i = this._owner.y - i;
this._owner.updateGearFromRelations(1, e, i);
if (null != this._owner.parent) {
var h = this._owner.parent._transitions.length;
if (h > 0) for (s = 0; s < h; ++s) this._owner.parent._transitions[s].updateFromRelations(this._owner.id, e, i);
}
}
this._owner.relations.handling = null;
}
};
e.prototype.__targetSizeChanged = function(t) {
if (null == this._owner.relations.handling) {
this._owner.relations.handling = this._target;
for (var e = this._owner.x, i = this._owner.y, n = this._owner._rawWidth, o = this._owner._rawHeight, r = this._defs.length, s = 0; s < r; s++) {
var a = this._defs[s];
this.applyOnSizeChanged(a);
}
this._targetWidth = this._target._width;
this._targetHeight = this._target._height;
if (e != this._owner.x || i != this._owner.y) {
e = this._owner.x - e;
i = this._owner.y - i;
this._owner.updateGearFromRelations(1, e, i);
if (null != this._owner.parent) {
var h = this._owner.parent._transitions.length;
if (h > 0) for (s = 0; s < h; ++s) this._owner.parent._transitions[s].updateFromRelations(this._owner.id, e, i);
}
}
if (n != this._owner._rawWidth || o != this._owner._rawHeight) {
n = this._owner._rawWidth - n;
o = this._owner._rawHeight - o;
this._owner.updateGearFromRelations(2, n, o);
}
this._owner.relations.handling = null;
}
};
e.prototype.__targetSizeWillChange = function(t) {
this._owner.relations.sizeDirty = !0;
};
return e;
}();
t.RelationItem = e;
var i = function() {
function t() {}
t.prototype.copyFrom = function(t) {
this.percent = t.percent;
this.type = t.type;
this.axis = t.axis;
};
return t;
}();
t.RelationDef = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(t) {
this._owner = t;
this._items = new Array();
}
e.prototype.add = function(e, i, n) {
for (var o = this._items.length, r = 0; r < o; r++) {
var s = this._items[r];
if (s.target == e) {
s.add(i, n);
return;
}
}
var a = new t.RelationItem(this._owner);
a.target = e;
a.add(i, n);
this._items.push(a);
};
e.prototype.remove = function(t, e) {
void 0 === e && (e = 0);
for (var i = this._items.length, n = 0; n < i; ) {
var o = this._items[n];
if (o.target == t) {
o.remove(e);
if (o.isEmpty) {
o.dispose();
this._items.splice(n, 1);
i--;
} else n++;
} else n++;
}
};
e.prototype.contains = function(t) {
for (var e = this._items.length, i = 0; i < e; i++) {
if (this._items[i].target == t) return !0;
}
return !1;
};
e.prototype.clearFor = function(t) {
for (var e = this._items.length, i = 0; i < e; ) {
var n = this._items[i];
if (n.target == t) {
n.dispose();
this._items.splice(i, 1);
e--;
} else i++;
}
};
e.prototype.clearAll = function() {
for (var t = this._items.length, e = 0; e < t; e++) {
this._items[e].dispose();
}
this._items.length = 0;
};
e.prototype.copyFrom = function(e) {
this.clearAll();
for (var i = e._items, n = i.length, o = 0; o < n; o++) {
var r = i[o], s = new t.RelationItem(this._owner);
s.copyFrom(r);
this._items.push(s);
}
};
e.prototype.dispose = function() {
this.clearAll();
};
e.prototype.onOwnerSizeChanged = function(t, e, i) {
if (0 != this._items.length) for (var n = this._items.length, o = 0; o < n; o++) {
this._items[o].applyOnSelfResized(t, e, i);
}
};
e.prototype.ensureRelationsSizeCorrect = function() {
if (0 != this._items.length) {
this.sizeDirty = !1;
for (var t = this._items.length, e = 0; e < t; e++) {
this._items[e].target.ensureSizeCorrect();
}
}
};
Object.defineProperty(e.prototype, "empty", {
get: function() {
return 0 == this._items.length;
},
enumerable: !0,
configurable: !0
});
e.prototype.setup = function(e, i) {
for (var n, o = e.readByte(), r = 0; r < o; r++) {
var s = e.readShort();
n = -1 == s ? this._owner.parent : i ? this._owner.getChildAt(s) : this._owner.parent.getChildAt(s);
var a = new t.RelationItem(this._owner);
a.target = n;
this._items.push(a);
for (var h = e.readByte(), l = 0; l < h; l++) {
var c = e.readByte(), u = e.readBool();
a.internalAdd(c, u);
}
}
};
return e;
}();
t.Relations = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
return null !== e && e.apply(this, arguments) || this;
}
i.prototype.setup = function(e) {
this._owner = this.node.$gobj;
this._maskContainer = new cc.Node("ScrollPane");
this._maskContainer.setAnchorPoint(0, 1);
this._maskContainer.parent = this._owner.node;
this._container = this._owner._container;
this._container.parent = this._maskContainer;
this._scrollBarMargin = new t.Margin();
this._scrollBarVisible = !0;
this._mouseWheelEnabled = !0;
this._xPos = 0;
this._yPos = 0;
this._aniFlag = 0;
this._footerLockedSize = 0;
this._headerLockedSize = 0;
this._viewSize = new cc.Vec2();
this._contentSize = new cc.Vec2();
this._pageSize = new cc.Vec2(1, 1);
this._overlapSize = new cc.Vec2();
this._tweenTime = new cc.Vec2();
this._tweenStart = new cc.Vec2();
this._tweenDuration = new cc.Vec2();
this._tweenChange = new cc.Vec2();
this._velocity = new cc.Vec2();
this._containerPos = new cc.Vec2();
this._beginTouchPos = new cc.Vec2();
this._lastTouchPos = new cc.Vec2();
this._lastTouchGlobalPos = new cc.Vec2();
this._scrollStep = t.UIConfig.defaultScrollStep;
this._mouseWheelStep = 2 * this._scrollStep;
this._decelerationRate = t.UIConfig.defaultScrollDecelerationRate;
this._owner.on(t.Event.TOUCH_BEGIN, this.onTouchBegin, this);
this._owner.on(t.Event.TOUCH_MOVE, this.onTouchMove, this);
this._owner.on(t.Event.TOUCH_END, this.onTouchEnd, this);
this._owner.on(t.Event.MOUSE_WHEEL, this.onMouseWheel, this);
this._scrollType = e.readByte();
var i = e.readByte(), n = e.readInt();
if (e.readBool()) {
this._scrollBarMargin.top = e.readInt();
this._scrollBarMargin.bottom = e.readInt();
this._scrollBarMargin.left = e.readInt();
this._scrollBarMargin.right = e.readInt();
}
var o = e.readS(), r = e.readS(), s = e.readS(), a = e.readS();
this._displayOnLeft = 0 != (1 & n);
this._snapToItem = 0 != (2 & n);
this._displayInDemand = 0 != (4 & n);
this._pageMode = 0 != (8 & n);
this._touchEffect = !!(16 & n) || !(32 & n) && t.UIConfig.defaultScrollTouchEffect;
this._bouncebackEffect = !!(64 & n) || !(128 & n) && t.UIConfig.defaultScrollBounceEffect;
this._inertiaDisabled = 0 != (256 & n);
0 == (512 & n) && this._maskContainer.addComponent(cc.Mask);
i == t.ScrollBarDisplayType.Default && (i = t.UIConfig.defaultScrollBarDisplay);
if (i != t.ScrollBarDisplayType.Hidden) {
if (this._scrollType == t.ScrollType.Both || this._scrollType == t.ScrollType.Vertical) {
if (h = o || t.UIConfig.verticalScrollBar) {
this._vtScrollBar = t.UIPackage.createObjectFromURL(h);
if (!this._vtScrollBar) throw "cannot create scrollbar from " + h;
this._vtScrollBar.setScrollPane(this, !0);
this._vtScrollBar.node.parent = this._owner.node;
}
}
if (this._scrollType == t.ScrollType.Both || this._scrollType == t.ScrollType.Horizontal) {
var h;
if (h = r || t.UIConfig.horizontalScrollBar) {
this._hzScrollBar = t.UIPackage.createObjectFromURL(h);
if (!this._hzScrollBar) throw "cannot create scrollbar from " + h;
this._hzScrollBar.setScrollPane(this, !1);
this._hzScrollBar.node.parent = this._owner.node;
}
}
this._scrollBarDisplayAuto = i == t.ScrollBarDisplayType.Auto;
if (this._scrollBarDisplayAuto) {
this._scrollBarVisible = !1;
this._vtScrollBar && (this._vtScrollBar.node.active = !1);
this._hzScrollBar && (this._hzScrollBar.node.active = !1);
this._owner.on(t.Event.ROLL_OVER, this.onRollOver, this);
this._owner.on(t.Event.ROLL_OUT, this.onRollOut, this);
}
}
if (s) {
this._header = t.UIPackage.createObjectFromURL(s);
if (null == this._header) throw "cannot create scrollPane header from " + s;
this._maskContainer.insertChild(this._header.node, 0);
}
if (a) {
this._footer = t.UIPackage.createObjectFromURL(a);
if (null == this._footer) throw "cannot create scrollPane footer from " + a;
this._maskContainer.insertChild(this._footer.node, 0);
}
this._refreshBarAxis = this._scrollType == t.ScrollType.Both || this._scrollType == t.ScrollType.Vertical ? "y" : "x";
this.setSize(this._owner.width, this._owner.height);
};
i.prototype.onDestroy = function() {
this._pageController = null;
null != this._hzScrollBar && this._hzScrollBar.dispose();
null != this._vtScrollBar && this._vtScrollBar.dispose();
null != this._header && this._header.dispose();
null != this._footer && this._footer.dispose();
};
i.prototype.hitTest = function(t) {
var e;
if (this._vtScrollBar && (e = this._vtScrollBar.hitTest(t))) return e;
if (this._hzScrollBar && (e = this._hzScrollBar.hitTest(t))) return e;
if (this._header && this._header.node.activeInHierarchy && (e = this._header.hitTest(t))) return e;
if (this._footer && this._footer.node.activeInHierarchy && (e = this._footer.hitTest(t))) return e;
var i = this._maskContainer.convertToNodeSpace(t);
return i.x >= 0 && i.y >= 0 && i.x < this._viewSize.x && i.y < this._viewSize.y ? this._owner : null;
};
Object.defineProperty(i.prototype, "owner", {
get: function() {
return this._owner;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "hzScrollBar", {
get: function() {
return this._hzScrollBar;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "vtScrollBar", {
get: function() {
return this._vtScrollBar;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "header", {
get: function() {
return this._header;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "footer", {
get: function() {
return this._footer;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "bouncebackEffect", {
get: function() {
return this._bouncebackEffect;
},
set: function(t) {
this._bouncebackEffect = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "touchEffect", {
get: function() {
return this._touchEffect;
},
set: function(t) {
this._touchEffect = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "scrollStep", {
get: function() {
return this._scrollStep;
},
set: function(e) {
this._scrollStep = e;
0 == this._scrollStep && (this._scrollStep = t.UIConfig.defaultScrollStep);
this._mouseWheelStep = 2 * this._scrollStep;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "decelerationRate", {
get: function() {
return this._decelerationRate;
},
set: function(t) {
this._decelerationRate = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "snapToItem", {
get: function() {
return this._snapToItem;
},
set: function(t) {
this._snapToItem = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "mouseWheelEnabled", {
get: function() {
return this._mouseWheelEnabled;
},
set: function(t) {
this._mouseWheelEnabled = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "percX", {
get: function() {
return 0 == this._overlapSize.x ? 0 : this._xPos / this._overlapSize.x;
},
set: function(t) {
this.setPercX(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setPercX = function(e, i) {
this._owner.ensureBoundsCorrect();
this.setPosX(this._overlapSize.x * t.ToolSet.clamp01(e), i);
};
Object.defineProperty(i.prototype, "percY", {
get: function() {
return 0 == this._overlapSize.y ? 0 : this._yPos / this._overlapSize.y;
},
set: function(t) {
this.setPercY(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setPercY = function(e, i) {
this._owner.ensureBoundsCorrect();
this.setPosY(this._overlapSize.y * t.ToolSet.clamp01(e), i);
};
Object.defineProperty(i.prototype, "posX", {
get: function() {
return this._xPos;
},
set: function(t) {
this.setPosX(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setPosX = function(e, i) {
this._owner.ensureBoundsCorrect();
1 == this._loop && (e = this.loopCheckingNewPos(e, "x"));
if ((e = t.ToolSet.clamp(e, 0, this._overlapSize.x)) != this._xPos) {
this._xPos = e;
this.posChanged(i);
}
};
Object.defineProperty(i.prototype, "posY", {
get: function() {
return this._yPos;
},
set: function(t) {
this.setPosY(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setPosY = function(e, i) {
this._owner.ensureBoundsCorrect();
1 == this._loop && (e = this.loopCheckingNewPos(e, "y"));
if ((e = t.ToolSet.clamp(e, 0, this._overlapSize.y)) != this._yPos) {
this._yPos = e;
this.posChanged(i);
}
};
Object.defineProperty(i.prototype, "contentWidth", {
get: function() {
return this._contentSize.x;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "contentHeight", {
get: function() {
return this._contentSize.y;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "viewWidth", {
get: function() {
return this._viewSize.x;
},
set: function(t) {
t = t + this._owner.margin.left + this._owner.margin.right;
null != this._vtScrollBar && (t += this._vtScrollBar.width);
this._owner.width = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "viewHeight", {
get: function() {
return this._viewSize.y;
},
set: function(t) {
t = t + this._owner.margin.top + this._owner.margin.bottom;
null != this._hzScrollBar && (t += this._hzScrollBar.height);
this._owner.height = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "currentPageX", {
get: function() {
if (!this._pageMode) return 0;
var t = Math.floor(this._xPos / this._pageSize.x);
this._xPos - t * this._pageSize.x > .5 * this._pageSize.x && t++;
return t;
},
set: function(t) {
this.setCurrentPageX(t, !1);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "currentPageY", {
get: function() {
if (!this._pageMode) return 0;
var t = Math.floor(this._yPos / this._pageSize.y);
this._yPos - t * this._pageSize.y > .5 * this._pageSize.y && t++;
return t;
},
set: function(t) {
this.setCurrentPageY(t, !1);
},
enumerable: !0,
configurable: !0
});
i.prototype.setCurrentPageX = function(t, e) {
this._pageMode && this._overlapSize.x > 0 && this.setPosX(t * this._pageSize.x, e);
};
i.prototype.setCurrentPageY = function(t, e) {
this._pageMode && this._overlapSize.y > 0 && this.setPosY(t * this._pageSize.y, e);
};
Object.defineProperty(i.prototype, "isBottomMost", {
get: function() {
return this._yPos == this._overlapSize.y || 0 == this._overlapSize.y;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "isRightMost", {
get: function() {
return this._xPos == this._overlapSize.x || 0 == this._overlapSize.x;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "pageController", {
get: function() {
return this._pageController;
},
set: function(t) {
this._pageController = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "scrollingPosX", {
get: function() {
return t.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "scrollingPosY", {
get: function() {
return t.ToolSet.clamp(- -this._container.y, 0, this._overlapSize.y);
},
enumerable: !0,
configurable: !0
});
i.prototype.scrollTop = function(t) {
this.setPercY(0, t);
};
i.prototype.scrollBottom = function(t) {
this.setPercY(1, t);
};
i.prototype.scrollUp = function(t, e) {
void 0 == t && (t = 1);
this._pageMode ? this.setPosY(this._yPos - this._pageSize.y * t, e) : this.setPosY(this._yPos - this._scrollStep * t, e);
};
i.prototype.scrollDown = function(t, e) {
void 0 == t && (t = 1);
this._pageMode ? this.setPosY(this._yPos + this._pageSize.y * t, e) : this.setPosY(this._yPos + this._scrollStep * t, e);
};
i.prototype.scrollLeft = function(t, e) {
void 0 == t && (t = 1);
this._pageMode ? this.setPosX(this._xPos - this._pageSize.x * t, e) : this.setPosX(this._xPos - this._scrollStep * t, e);
};
i.prototype.scrollRight = function(t, e) {
void 0 == t && (t = 1);
this._pageMode ? this.setPosX(this._xPos + this._pageSize.x * t, e) : this.setPosX(this._xPos + this._scrollStep * t, e);
};
i.prototype.scrollToView = function(e, n, o) {
this._owner.ensureBoundsCorrect();
this._needRefresh && this.refresh();
var r;
if (e instanceof t.GObject) if (e.parent != this._owner) {
e.parent.localToGlobalRect(e.x, e.y, e.width, e.height, i.sHelperRect);
r = this._owner.globalToLocalRect(i.sHelperRect.x, i.sHelperRect.y, i.sHelperRect.width, i.sHelperRect.height, i.sHelperRect);
} else {
(r = i.sHelperRect).x = e.x;
r.y = e.y;
r.width = e.width;
r.height = e.height;
} else r = e;
if (this._overlapSize.y > 0) {
var s = this._yPos + this._viewSize.y;
o || r.y <= this._yPos || r.height >= this._viewSize.y ? this._pageMode ? this.setPosY(Math.floor(r.y / this._pageSize.y) * this._pageSize.y, n) : this.setPosY(r.y, n) : r.y + r.height > s && (this._pageMode ? this.setPosY(Math.floor(r.y / this._pageSize.y) * this._pageSize.y, n) : r.height <= this._viewSize.y / 2 ? this.setPosY(r.y + 2 * r.height - this._viewSize.y, n) : this.setPosY(r.y + r.height - this._viewSize.y, n));
}
if (this._overlapSize.x > 0) {
var a = this._xPos + this._viewSize.x;
o || r.x <= this._xPos || r.width >= this._viewSize.x ? this._pageMode ? this.setPosX(Math.floor(r.x / this._pageSize.x) * this._pageSize.x, n) : this.setPosX(r.x, n) : r.x + r.width > a && (this._pageMode ? this.setPosX(Math.floor(r.x / this._pageSize.x) * this._pageSize.x, n) : r.width <= this._viewSize.x / 2 ? this.setPosX(r.x + 2 * r.width - this._viewSize.x, n) : this.setPosX(r.x + r.width - this._viewSize.x, n));
}
!n && this._needRefresh && this.refresh();
};
i.prototype.isChildInView = function(t) {
if (this._overlapSize.y > 0) {
var e = t.y + -this._container.y;
if (e < -t.height || e > this._viewSize.y) return !1;
}
return !(this._overlapSize.x > 0 && ((e = t.x + this._container.x) < -t.width || e > this._viewSize.x));
};
i.prototype.cancelDragging = function() {
i.draggingPane == this && (i.draggingPane = null);
i._gestureFlag = 0;
this.isDragged = !1;
};
i.prototype.lockHeader = function(t) {
if (this._headerLockedSize != t) {
var e = this._container.x, n = -this._container.y, o = "x" == this._refreshBarAxis ? e : n;
this._headerLockedSize = t;
if (!this._refreshEventDispatching && o >= 0) {
this._tweenStart.x = e;
this._tweenStart.y = n;
this._tweenChange.set(cc.Vec2.ZERO);
this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
this._tweenDuration.x = this._tweenDuration.y = i.TWEEN_TIME_DEFAULT;
this._tweenTime.set(cc.Vec2.ZERO);
this._tweening = 2;
}
}
};
i.prototype.lockFooter = function(t) {
if (this._footerLockedSize != t) {
var e = this._container.x, n = -this._container.y, o = "x" == this._refreshBarAxis ? e : n;
this._footerLockedSize = t;
if (!this._refreshEventDispatching && o <= -this._overlapSize[this._refreshBarAxis]) {
this._tweenStart.x = e;
this._tweenStart.y = n;
this._tweenChange.set(cc.Vec2.ZERO);
var r = this._overlapSize[this._refreshBarAxis];
0 == r ? r = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0) : r += this._footerLockedSize;
this._tweenChange[this._refreshBarAxis] = -r - this._tweenStart[this._refreshBarAxis];
this._tweenDuration.x = this._tweenDuration.y = i.TWEEN_TIME_DEFAULT;
this._tweenTime.set(cc.Vec2.ZERO);
this._tweening = 2;
}
}
};
i.prototype.onOwnerSizeChanged = function() {
this.setSize(this._owner.width, this._owner.height);
this.posChanged(!1);
};
i.prototype.handleControllerChanged = function(e) {
this._pageController == e && (this._scrollType == t.ScrollType.Horizontal ? this.setCurrentPageX(e.selectedIndex, !0) : this.setCurrentPageY(e.selectedIndex, !0));
};
i.prototype.updatePageController = function() {
if (null != this._pageController && !this._pageController.changing) {
var e;
if ((e = this._scrollType == t.ScrollType.Horizontal ? this.currentPageX : this.currentPageY) < this._pageController.pageCount) {
var i = this._pageController;
this._pageController = null;
i.selectedIndex = e;
this._pageController = i;
}
}
};
i.prototype.adjustMaskContainer = function() {
var t = 0;
this._displayOnLeft && null != this._vtScrollBar && (t = Math.floor(this._owner.margin.left + this._vtScrollBar.width));
this._maskContainer.setAnchorPoint(this._owner._alignOffset.x / this._viewSize.x, 1 - this._owner._alignOffset.y / this._viewSize.y);
this._owner._customMask ? this._maskContainer.setPosition(t + this._owner._alignOffset.x, -this._owner._alignOffset.y) : this._maskContainer.setPosition(this._owner._pivotCorrectX + t + this._owner._alignOffset.x, this._owner._pivotCorrectY - this._owner._alignOffset.y);
};
i.prototype.setSize = function(t, e) {
if (this._hzScrollBar) {
this._hzScrollBar.y = e - this._hzScrollBar.height;
if (this._vtScrollBar && !this._vScrollNone) {
this._hzScrollBar.width = t - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
this._displayOnLeft ? this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width : this._hzScrollBar.x = this._scrollBarMargin.left;
} else {
this._hzScrollBar.width = t - this._scrollBarMargin.left - this._scrollBarMargin.right;
this._hzScrollBar.x = this._scrollBarMargin.left;
}
}
if (this._vtScrollBar) {
this._displayOnLeft || (this._vtScrollBar.x = t - this._vtScrollBar.width);
this._hzScrollBar ? this._vtScrollBar.height = e - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom : this._vtScrollBar.height = e - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
this._vtScrollBar.y = this._scrollBarMargin.top;
}
this._viewSize.x = t;
this._viewSize.y = e;
this._hzScrollBar && !this._hScrollNone && (this._viewSize.y -= this._hzScrollBar.height);
this._vtScrollBar && !this._vScrollNone && (this._viewSize.x -= this._vtScrollBar.width);
this._viewSize.x -= this._owner.margin.left + this._owner.margin.right;
this._viewSize.y -= this._owner.margin.top + this._owner.margin.bottom;
this._viewSize.x = Math.max(1, this._viewSize.x);
this._viewSize.y = Math.max(1, this._viewSize.y);
this._pageSize.x = this._viewSize.x;
this._pageSize.y = this._viewSize.y;
this.adjustMaskContainer();
this.handleSizeChanged();
};
i.prototype.setContentSize = function(t, e) {
if (this._contentSize.x != t || this._contentSize.y != e) {
this._contentSize.x = t;
this._contentSize.y = e;
this.handleSizeChanged();
}
};
i.prototype.changeContentSizeOnScrolling = function(t, e, i, n) {
var o = this._xPos == this._overlapSize.x, r = this._yPos == this._overlapSize.y;
this._contentSize.x += t;
this._contentSize.y += e;
this.handleSizeChanged();
if (1 == this._tweening) {
if (0 != t && o && this._tweenChange.x < 0) {
this._xPos = this._overlapSize.x;
this._tweenChange.x = -this._xPos - this._tweenStart.x;
}
if (0 != e && r && this._tweenChange.y < 0) {
this._yPos = this._overlapSize.y;
this._tweenChange.y = -this._yPos - this._tweenStart.y;
}
} else if (2 == this._tweening) {
if (0 != i) {
this._container.x -= i;
this._tweenStart.x -= i;
this._xPos = -this._container.x;
}
if (0 != n) {
this._container.y += n;
this._tweenStart.y -= n;
this._yPos = - -this._container.y;
}
} else if (this.isDragged) {
if (0 != i) {
this._container.x -= i;
this._containerPos.x -= i;
this._xPos = -this._container.x;
}
if (0 != n) {
this._container.y += n;
this._containerPos.y -= n;
this._yPos = - -this._container.y;
}
} else {
if (0 != t && o) {
this._xPos = this._overlapSize.x;
this._container.x = -this._xPos;
}
if (0 != e && r) {
this._yPos = this._overlapSize.y;
this._container.y = this._yPos;
}
}
this._pageMode && this.updatePageController();
};
i.prototype.handleSizeChanged = function(e) {
if (this._displayInDemand) {
if (this._vtScrollBar) if (this._contentSize.y <= this._viewSize.y) {
if (!this._vScrollNone) {
this._vScrollNone = !0;
this._viewSize.x += this._vtScrollBar.width;
}
} else if (this._vScrollNone) {
this._vScrollNone = !1;
this._viewSize.x -= this._vtScrollBar.width;
}
if (this._hzScrollBar) if (this._contentSize.x <= this._viewSize.x) {
if (!this._hScrollNone) {
this._hScrollNone = !0;
this._viewSize.y += this._hzScrollBar.height;
}
} else if (this._hScrollNone) {
this._hScrollNone = !1;
this._viewSize.y -= this._hzScrollBar.height;
}
}
if (this._vtScrollBar) if (this._viewSize.y < this._vtScrollBar.minSize) this._vtScrollBar.node.active = !1; else {
this._vtScrollBar.node.active = this._scrollBarVisible && !this._vScrollNone;
0 == this._contentSize.y ? this._vtScrollBar.displayPerc = 0 : this._vtScrollBar.displayPerc = Math.min(1, this._viewSize.y / this._contentSize.y);
}
if (this._hzScrollBar) if (this._viewSize.x < this._hzScrollBar.minSize) this._hzScrollBar.node.active = !1; else {
this._hzScrollBar.node.active = this._scrollBarVisible && !this._hScrollNone;
0 == this._contentSize.x ? this._hzScrollBar.displayPerc = 0 : this._hzScrollBar.displayPerc = Math.min(1, this._viewSize.x / this._contentSize.x);
}
this._maskContainer.setContentSize(this._viewSize.x, this._viewSize.y);
this._vtScrollBar && this._vtScrollBar.handlePositionChanged();
this._hzScrollBar && this._hzScrollBar.handlePositionChanged();
this._header && this._header.handlePositionChanged();
this._footer && this._footer.handlePositionChanged();
this._scrollType == t.ScrollType.Horizontal || this._scrollType == t.ScrollType.Both ? this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x)) : this._overlapSize.x = 0;
this._scrollType == t.ScrollType.Vertical || this._scrollType == t.ScrollType.Both ? this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y)) : this._overlapSize.y = 0;
this._xPos = t.ToolSet.clamp(this._xPos, 0, this._overlapSize.x);
this._yPos = t.ToolSet.clamp(this._yPos, 0, this._overlapSize.y);
var i = this._overlapSize[this._refreshBarAxis];
0 == i ? i = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0) : i += this._footerLockedSize;
"x" == this._refreshBarAxis ? this._container.setPosition(t.ToolSet.clamp(this._container.x, -i, this._headerLockedSize), -t.ToolSet.clamp(-this._container.y, -this._overlapSize.y, 0)) : this._container.setPosition(t.ToolSet.clamp(this._container.x, -this._overlapSize.x, 0), -t.ToolSet.clamp(-this._container.y, -i, this._headerLockedSize));
null != this._header && ("x" == this._refreshBarAxis ? this._header.height = this._viewSize.y : this._header.width = this._viewSize.x);
null != this._footer && ("y" == this._refreshBarAxis ? this._footer.height = this._viewSize.y : this._footer.width = this._viewSize.x);
this.syncScrollBar(!0);
this.checkRefreshBar();
this._pageMode && this.updatePageController();
};
i.prototype.posChanged = function(t) {
0 == this._aniFlag ? this._aniFlag = t ? 1 : -1 : 1 != this._aniFlag || t || (this._aniFlag = -1);
this._needRefresh = !0;
cc.director.getScheduler().isScheduled(this.refresh, this) || this.scheduleOnce(this.refresh);
};
i.prototype.refresh = function(e) {
this._needRefresh = !1;
this.unschedule(this.refresh);
if (this._pageMode || this._snapToItem) {
i.sEndPos.x = -this._xPos;
i.sEndPos.y = -this._yPos;
this.alignPosition(i.sEndPos, !1);
this._xPos = -i.sEndPos.x;
this._yPos = -i.sEndPos.y;
}
this.refresh2();
this._owner.node.emit(t.Event.SCROLL, this._owner);
if (this._needRefresh) {
this._needRefresh = !1;
this.unschedule(this.refresh);
this.refresh2();
}
this.syncScrollBar();
this._aniFlag = 0;
};
i.prototype.refresh2 = function() {
if (1 != this._aniFlag || this.isDragged) {
0 != this._tweening && this.killTween();
this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));
this.loopCheckingCurrent();
} else {
var t, e;
if (this._overlapSize.x > 0) t = -Math.floor(this._xPos); else {
0 != this._container.x && (this._container.x = 0);
t = 0;
}
if (this._overlapSize.y > 0) e = -Math.floor(this._yPos); else {
0 != this._container.y && (this._container.y = 0);
e = 0;
}
if (t != this._container.x || e != -this._container.y) {
this._tweening = 1;
this._tweenTime.set(cc.Vec2.ZERO);
this._tweenDuration.x = this._tweenDuration.y = i.TWEEN_TIME_GO;
this._tweenStart.x = this._container.x;
this._tweenStart.y = -this._container.y;
this._tweenChange.x = t - this._tweenStart.x;
this._tweenChange.y = e - this._tweenStart.y;
} else 0 != this._tweening && this.killTween();
}
this._pageMode && this.updatePageController();
};
i.prototype.syncScrollBar = function(e) {
if (null != this._vtScrollBar) {
this._vtScrollBar.scrollPerc = 0 == this._overlapSize.y ? 0 : t.ToolSet.clamp(- -this._container.y, 0, this._overlapSize.y) / this._overlapSize.y;
this._scrollBarDisplayAuto && this.showScrollBar(!e);
}
if (null != this._hzScrollBar) {
this._hzScrollBar.scrollPerc = 0 == this._overlapSize.x ? 0 : t.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x) / this._overlapSize.x;
this._scrollBarDisplayAuto && this.showScrollBar(!e);
}
};
i.prototype.onTouchBegin = function(e) {
if (this._touchEffect) {
e.captureTouch();
if (0 != this._tweening) {
this.killTween();
t.GRoot.inst.inputProcessor.cancelClick(e.touchId);
this.isDragged = !0;
} else this.isDragged = !1;
var n = this._owner.globalToLocal(e.pos.x, e.pos.y, i.sHelperPoint);
this._containerPos.x = this._container.x;
this._containerPos.y = -this._container.y;
this._beginTouchPos.set(n);
this._lastTouchPos.set(n);
this._lastTouchGlobalPos.set(e.pos);
this._isHoldAreaDone = !1;
this._velocity.set(cc.Vec2.ZERO);
this._velocityScale = 1;
this._lastMoveTime = t.ToolSet.getTime();
}
};
i.prototype.onTouchMove = function(e) {
if (cc.isValid(this._owner.node) && this._touchEffect && (null == i.draggingPane || i.draggingPane == this) && null == t.GObject.draggingObject) {
var n, o, r, s = this._owner.globalToLocal(e.pos.x, e.pos.y, i.sHelperPoint), a = t.UIConfig.touchScrollSensitivity;
if (this._scrollType == t.ScrollType.Vertical) {
if (!this._isHoldAreaDone) {
i._gestureFlag |= 1;
if ((n = Math.abs(this._beginTouchPos.y - s.y)) < a) return;
if (0 != (2 & i._gestureFlag) && n < Math.abs(this._beginTouchPos.x - s.x)) return;
}
o = !0;
} else if (this._scrollType == t.ScrollType.Horizontal) {
if (!this._isHoldAreaDone) {
i._gestureFlag |= 2;
if ((n = Math.abs(this._beginTouchPos.x - s.x)) < a) return;
if (0 != (1 & i._gestureFlag) && n < Math.abs(this._beginTouchPos.y - s.y)) return;
}
r = !0;
} else {
i._gestureFlag = 3;
if (!this._isHoldAreaDone && (n = Math.abs(this._beginTouchPos.y - s.y)) < a && (n = Math.abs(this._beginTouchPos.x - s.x)) < a) return;
o = r = !0;
}
var h = Math.floor(this._containerPos.x + s.x - this._beginTouchPos.x), l = Math.floor(this._containerPos.y + s.y - this._beginTouchPos.y);
o && (l > 0 ? this._bouncebackEffect ? null != this._header && 0 != this._header.maxHeight ? this._container.y = -Math.floor(Math.min(.5 * l, this._header.maxHeight)) : this._container.y = -Math.floor(Math.min(.5 * l, this._viewSize.y * i.PULL_RATIO)) : this._container.y = 0 : l < -this._overlapSize.y ? this._bouncebackEffect ? null != this._footer && this._footer.maxHeight > 0 ? this._container.y = -Math.floor(Math.max(.5 * (l + this._overlapSize.y), -this._footer.maxHeight) - this._overlapSize.y) : this._container.y = -Math.floor(Math.max(.5 * (l + this._overlapSize.y), -this._viewSize.y * i.PULL_RATIO) - this._overlapSize.y) : this._container.y = this._overlapSize.y : this._container.y = -l);
r && (h > 0 ? this._bouncebackEffect ? null != this._header && 0 != this._header.maxWidth ? this._container.x = Math.floor(Math.min(.5 * h, this._header.maxWidth)) : this._container.x = Math.floor(Math.min(.5 * h, this._viewSize.x * i.PULL_RATIO)) : this._container.x = 0 : h < 0 - this._overlapSize.x ? this._bouncebackEffect ? null != this._footer && this._footer.maxWidth > 0 ? this._container.x = Math.floor(Math.max(.5 * (h + this._overlapSize.x), -this._footer.maxWidth) - this._overlapSize.x) : this._container.x = Math.floor(Math.max(.5 * (h + this._overlapSize.x), -this._viewSize.x * i.PULL_RATIO) - this._overlapSize.x) : this._container.x = -this._overlapSize.x : this._container.x = h);
var c = t.ToolSet.getTime(), u = Math.max(c - this._lastMoveTime, 1 / 60), _ = s.x - this._lastTouchPos.x, d = s.y - this._lastTouchPos.y;
r || (_ = 0);
o || (d = 0);
if (0 != u) {
var p = 60 * u - 1;
if (p > 1) {
var f = Math.pow(.833, p);
this._velocity.x = this._velocity.x * f;
this._velocity.y = this._velocity.y * f;
}
this._velocity.x = t.ToolSet.lerp(this._velocity.x, 60 * _ / 60 / u, 10 * u);
this._velocity.y = t.ToolSet.lerp(this._velocity.y, 60 * d / 60 / u, 10 * u);
}
var g = this._lastTouchGlobalPos.x - e.pos.x, y = this._lastTouchGlobalPos.y - e.pos.y;
0 != _ ? this._velocityScale = Math.abs(g / _) : 0 != d && (this._velocityScale = Math.abs(y / d));
this._lastTouchPos.set(s);
this._lastTouchGlobalPos.x = e.pos.x;
this._lastTouchGlobalPos.y = e.pos.y;
this._lastMoveTime = c;
this._overlapSize.x > 0 && (this._xPos = t.ToolSet.clamp(-this._container.x, 0, this._overlapSize.x));
this._overlapSize.y > 0 && (this._yPos = t.ToolSet.clamp(- -this._container.y, 0, this._overlapSize.y));
if (0 != this._loop) {
h = this._container.x;
l = -this._container.y;
if (this.loopCheckingCurrent()) {
this._containerPos.x += this._container.x - h;
this._containerPos.y += -this._container.y - l;
}
}
i.draggingPane = this;
this._isHoldAreaDone = !0;
this.isDragged = !0;
this.syncScrollBar();
this.checkRefreshBar();
this._pageMode && this.updatePageController();
this._owner.node.emit(t.Event.SCROLL), this._owner;
}
};
i.prototype.onTouchEnd = function(e) {
i.draggingPane == this && (i.draggingPane = null);
i._gestureFlag = 0;
if (this.isDragged && this._touchEffect && this._owner.node.activeInHierarchy) {
this.isDragged = !1;
this._tweenStart.x = this._container.x;
this._tweenStart.y = -this._container.y;
i.sEndPos.set(this._tweenStart);
var n = !1;
if (this._container.x > 0) {
i.sEndPos.x = 0;
n = !0;
} else if (this._container.x < -this._overlapSize.x) {
i.sEndPos.x = -this._overlapSize.x;
n = !0;
}
if (-this._container.y > 0) {
i.sEndPos.y = 0;
n = !0;
} else if (-this._container.y < -this._overlapSize.y) {
i.sEndPos.y = -this._overlapSize.y;
n = !0;
}
if (n) {
this._tweenChange.x = i.sEndPos.x - this._tweenStart.x;
this._tweenChange.y = i.sEndPos.y - this._tweenStart.y;
if (this._tweenChange.x < -t.UIConfig.touchDragSensitivity || this._tweenChange.y < -t.UIConfig.touchDragSensitivity) {
this._refreshEventDispatching = !0;
this._owner.node.emit(t.Event.PULL_DOWN_RELEASE), this._owner;
this._refreshEventDispatching = !1;
} else if (this._tweenChange.x > t.UIConfig.touchDragSensitivity || this._tweenChange.y > t.UIConfig.touchDragSensitivity) {
this._refreshEventDispatching = !0;
this._owner.node.emit(t.Event.PULL_UP_RELEASE, this._owner);
this._refreshEventDispatching = !1;
}
if (this._headerLockedSize > 0 && 0 == i.sEndPos[this._refreshBarAxis]) {
i.sEndPos[this._refreshBarAxis] = this._headerLockedSize;
this._tweenChange.x = i.sEndPos.x - this._tweenStart.x;
this._tweenChange.y = i.sEndPos.y - this._tweenStart.y;
} else if (this._footerLockedSize > 0 && i.sEndPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
var o = this._overlapSize[this._refreshBarAxis];
0 == o ? o = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0) : o += this._footerLockedSize;
i.sEndPos[this._refreshBarAxis] = -o;
this._tweenChange.x = i.sEndPos.x - this._tweenStart.x;
this._tweenChange.y = i.sEndPos.y - this._tweenStart.y;
}
this._tweenDuration.x = this._tweenDuration.y = i.TWEEN_TIME_DEFAULT;
} else {
if (this._inertiaDisabled) this._tweenDuration.x = this._tweenDuration.y = i.TWEEN_TIME_DEFAULT; else {
var r = 60 * (t.ToolSet.getTime() - this._lastMoveTime) - 1;
if (r > 1) {
var s = Math.pow(.833, r);
this._velocity.x = this._velocity.x * s;
this._velocity.y = this._velocity.y * s;
}
this.updateTargetAndDuration(this._tweenStart, i.sEndPos);
}
i.sOldChange.x = i.sEndPos.x - this._tweenStart.x;
i.sOldChange.y = i.sEndPos.y - this._tweenStart.y;
this.loopCheckingTarget(i.sEndPos);
(this._pageMode || this._snapToItem) && this.alignPosition(i.sEndPos, !0);
this._tweenChange.x = i.sEndPos.x - this._tweenStart.x;
this._tweenChange.y = i.sEndPos.y - this._tweenStart.y;
if (0 == this._tweenChange.x && 0 == this._tweenChange.y) {
this._scrollBarDisplayAuto && this.showScrollBar(!1);
return;
}
if (this._pageMode || this._snapToItem) {
this.fixDuration("x", i.sOldChange.x);
this.fixDuration("y", i.sOldChange.y);
}
}
this._tweening = 2;
this._tweenTime.set(cc.Vec2.ZERO);
} else this.isDragged = !1;
};
i.prototype.onRollOver = function() {
this.showScrollBar(!0);
};
i.prototype.onRollOut = function() {
this.showScrollBar(!1);
};
i.prototype.onMouseWheel = function(t) {
if (this._mouseWheelEnabled) {
var e = t.mouseWheelDelta > 0 ? -1 : 1;
this._overlapSize.x > 0 && 0 == this._overlapSize.y ? this._pageMode ? this.setPosX(this._xPos + this._pageSize.x * e, !1) : this.setPosX(this._xPos + this._mouseWheelStep * e, !1) : this._pageMode ? this.setPosY(this._yPos + this._pageSize.y * e, !1) : this.setPosY(this._yPos + this._mouseWheelStep * e, !1);
}
};
i.prototype.showScrollBar = function(t) {
if (t) {
this._showScrollBar(NaN);
this.unschedule(this._showScrollBar);
} else cc.director.getScheduler().isScheduled(this._showScrollBar, this) || this.scheduleOnce(this._showScrollBar, .5);
};
i.prototype._showScrollBar = function(t) {
var e = isNaN(t);
this._scrollBarVisible = e && this._viewSize.x > 0 && this._viewSize.y > 0;
this._vtScrollBar && (this._vtScrollBar.node.active = this._scrollBarVisible && !this._vScrollNone);
this._hzScrollBar && (this._hzScrollBar.node.active = this._scrollBarVisible && !this._hScrollNone);
};
i.prototype.getLoopPartSize = function(t, e) {
return (this._contentSize[e] + ("x" == e ? this._owner.columnGap : this._owner.lineGap)) / t;
};
i.prototype.loopCheckingCurrent = function() {
var t = !1;
if (1 == this._loop && this._overlapSize.x > 0) {
if (this._xPos < .001) {
this._xPos += this.getLoopPartSize(2, "x");
t = !0;
} else if (this._xPos >= this._overlapSize.x) {
this._xPos -= this.getLoopPartSize(2, "x");
t = !0;
}
} else if (2 == this._loop && this._overlapSize.y > 0) if (this._yPos < .001) {
this._yPos += this.getLoopPartSize(2, "y");
t = !0;
} else if (this._yPos >= this._overlapSize.y) {
this._yPos -= this.getLoopPartSize(2, "y");
t = !0;
}
t && this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));
return t;
};
i.prototype.loopCheckingTarget = function(t) {
1 == this._loop && this.loopCheckingTarget2(t, "x");
2 == this._loop && this.loopCheckingTarget2(t, "y");
};
i.prototype.loopCheckingTarget2 = function(t, e) {
var i, n;
if (t[e] > 0) {
i = this.getLoopPartSize(2, e);
if ((n = this._tweenStart[e] - i) <= 0 && n >= -this._overlapSize[e]) {
t[e] -= i;
this._tweenStart[e] = n;
}
} else if (t[e] < -this._overlapSize[e]) {
i = this.getLoopPartSize(2, e);
if ((n = this._tweenStart[e] + i) <= 0 && n >= -this._overlapSize[e]) {
t[e] += i;
this._tweenStart[e] = n;
}
}
};
i.prototype.loopCheckingNewPos = function(e, i) {
if (0 == this._overlapSize[i]) return e;
var n, o = "x" == i ? this._xPos : this._yPos, r = !1;
if (e < .001) {
if ((e += this.getLoopPartSize(2, i)) > o) {
n = this.getLoopPartSize(6, i);
n = Math.ceil((e - o) / n) * n;
o = t.ToolSet.clamp(o + n, 0, this._overlapSize[i]);
r = !0;
}
} else if (e >= this._overlapSize[i] && (e -= this.getLoopPartSize(2, i)) < o) {
n = this.getLoopPartSize(6, i);
n = Math.ceil((o - e) / n) * n;
o = t.ToolSet.clamp(o - n, 0, this._overlapSize[i]);
r = !0;
}
r && ("x" == i ? this._container.x = -Math.floor(o) : this._container.y = Math.floor(o));
return e;
};
i.prototype.alignPosition = function(t, e) {
if (this._pageMode) {
t.x = this.alignByPage(t.x, "x", e);
t.y = this.alignByPage(t.y, "y", e);
} else if (this._snapToItem) {
var n = this._owner.getSnappingPosition(-t.x, -t.y, i.sHelperPoint);
t.x < 0 && t.x > -this._overlapSize.x && (t.x = -n.x);
t.y < 0 && t.y > -this._overlapSize.y && (t.y = -n.y);
}
};
i.prototype.alignByPage = function(t, e, i) {
var n;
if (t > 0) n = 0; else if (t < -this._overlapSize[e]) n = Math.ceil(this._contentSize[e] / this._pageSize[e]) - 1; else {
n = Math.floor(-t / this._pageSize[e]);
var o = i ? t - this._containerPos[e] : t - ("x" == e ? this._container.x : -this._container.y), r = Math.min(this._pageSize[e], this._contentSize[e] - (n + 1) * this._pageSize[e]), s = -t - n * this._pageSize[e];
Math.abs(o) > this._pageSize[e] ? s > .5 * r && n++ : s > r * (o < 0 ? .3 : .7) && n++;
(t = -n * this._pageSize[e]) < -this._overlapSize[e] && (t = -this._overlapSize[e]);
}
if (i) {
var a, h = this._tweenStart[e];
a = h > 0 ? 0 : h < -this._overlapSize[e] ? Math.ceil(this._contentSize[e] / this._pageSize[e]) - 1 : Math.floor(-h / this._pageSize[e]);
var l = Math.floor(-this._containerPos[e] / this._pageSize[e]);
Math.abs(n - l) > 1 && Math.abs(a - l) <= 1 && (t = -(n = n > l ? l + 1 : l - 1) * this._pageSize[e]);
}
return t;
};
i.prototype.updateTargetAndDuration = function(t, e) {
e.x = this.updateTargetAndDuration2(t.x, "x");
e.y = this.updateTargetAndDuration2(t.y, "y");
};
i.prototype.updateTargetAndDuration2 = function(t, e) {
var n = this._velocity[e], o = 0;
if (t > 0) t = 0; else if (t < -this._overlapSize[e]) t = -this._overlapSize[e]; else {
var r = cc.sys.isMobile, s = Math.abs(n) * this._velocityScale;
r && (s *= 1136 / Math.max(cc.winSize.width, cc.winSize.height));
var a = 0;
this._pageMode || !r ? s > 500 && (a = Math.pow((s - 500) / 500, 2)) : s > 1e3 && (a = Math.pow((s - 1e3) / 1e3, 2));
if (0 != a) {
a > 1 && (a = 1);
s *= a;
n *= a;
this._velocity[e] = n;
o = Math.log(60 / s) / Math.log(this._decelerationRate) / 60;
t += Math.floor(n * o * .4);
}
}
o < i.TWEEN_TIME_DEFAULT && (o = i.TWEEN_TIME_DEFAULT);
this._tweenDuration[e] = o;
return t;
};
i.prototype.fixDuration = function(t, e) {
if (!(0 == this._tweenChange[t] || Math.abs(this._tweenChange[t]) >= Math.abs(e))) {
var n = Math.abs(this._tweenChange[t] / e) * this._tweenDuration[t];
n < i.TWEEN_TIME_DEFAULT && (n = i.TWEEN_TIME_DEFAULT);
this._tweenDuration[t] = n;
}
};
i.prototype.killTween = function() {
if (1 == this._tweening) {
this._container.setPosition(this._tweenStart.x + this._tweenChange.x, -(this._tweenStart.y + this._tweenChange.y));
this._owner.node.emit(t.Event.SCROLL, this._owner);
}
this._tweening = 0;
this._owner.node.emit(t.Event.SCROLL_END, this._owner);
};
i.prototype.checkRefreshBar = function() {
if (null != this._header || null != this._footer) {
var t = "x" == this._refreshBarAxis ? this._container.x : -this._container.y;
if (null != this._header) if (t > 0) {
this._header.node.active = !0;
var e = i.sHelperPoint;
e.x = this._header.width;
e.y = this._header.height;
e[this._refreshBarAxis] = t;
this._header.setSize(e.x, e.y);
} else this._header.node.active = !1;
if (null != this._footer) {
var n = this._overlapSize[this._refreshBarAxis];
if (t < -n || 0 == n && this._footerLockedSize > 0) {
this._footer.node.active = !0;
(e = i.sHelperPoint).x = this._footer.x;
e.y = this._footer.y;
e[this._refreshBarAxis] = n > 0 ? t + this._contentSize[this._refreshBarAxis] : Math.max(Math.min(t + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize), this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);
this._footer.setPosition(e.x, e.y);
e.x = this._footer.width;
e.y = this._footer.height;
e[this._refreshBarAxis] = n > 0 ? -n - t : this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];
this._footer.setSize(e.x, e.y);
} else this._footer.node.active = !1;
}
}
};
i.prototype.update = function(e) {
if (0 != this._tweening) {
var i = this.runTween("x", e), n = this.runTween("y", e);
this._container.setPosition(i, -n);
if (2 == this._tweening) {
this._overlapSize.x > 0 && (this._xPos = t.ToolSet.clamp(-i, 0, this._overlapSize.x));
this._overlapSize.y > 0 && (this._yPos = t.ToolSet.clamp(-n, 0, this._overlapSize.y));
this._pageMode && this.updatePageController();
}
if (0 == this._tweenChange.x && 0 == this._tweenChange.y) {
this._tweening = 0;
this.loopCheckingCurrent();
this.syncScrollBar(!0);
this.checkRefreshBar();
this._owner.node.emit(t.Event.SCROLL, this._owner);
this._owner.node.emit(t.Event.SCROLL_END, this._owner);
} else {
this.syncScrollBar(!1);
this.checkRefreshBar();
this._owner.node.emit(t.Event.SCROLL, this._owner);
}
return !0;
}
};
i.prototype.runTween = function(t, e) {
var n;
if (0 != this._tweenChange[t]) {
this._tweenTime[t] += e;
if (this._tweenTime[t] >= this._tweenDuration[t]) {
n = this._tweenStart[t] + this._tweenChange[t];
this._tweenChange[t] = 0;
} else {
var o = i.easeFunc(this._tweenTime[t], this._tweenDuration[t]);
n = this._tweenStart[t] + Math.floor(this._tweenChange[t] * o);
}
var r = 0, s = -this._overlapSize[t];
this._headerLockedSize > 0 && this._refreshBarAxis == t && (r = this._headerLockedSize);
if (this._footerLockedSize > 0 && this._refreshBarAxis == t) {
var a = this._overlapSize[this._refreshBarAxis];
0 == a ? a = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0) : a += this._footerLockedSize;
s = -a;
}
if (2 == this._tweening && this._bouncebackEffect) {
if (n > 20 + r && this._tweenChange[t] > 0 || n > r && 0 == this._tweenChange[t]) {
this._tweenTime[t] = 0;
this._tweenDuration[t] = i.TWEEN_TIME_DEFAULT;
this._tweenChange[t] = -n + r;
this._tweenStart[t] = n;
} else if (n < s - 20 && this._tweenChange[t] < 0 || n < s && 0 == this._tweenChange[t]) {
this._tweenTime[t] = 0;
this._tweenDuration[t] = i.TWEEN_TIME_DEFAULT;
this._tweenChange[t] = s - n;
this._tweenStart[t] = n;
}
} else if (n > r) {
n = r;
this._tweenChange[t] = 0;
} else if (n < s) {
n = s;
this._tweenChange[t] = 0;
}
} else n = "x" == t ? this._container.x : -this._container.y;
return n;
};
i.easeFunc = function(t, e) {
return (t = t / e - 1) * t * t + 1;
};
i._gestureFlag = 0;
i.TWEEN_TIME_GO = .5;
i.TWEEN_TIME_DEFAULT = .3;
i.PULL_RATIO = .5;
i.sHelperPoint = new cc.Vec2();
i.sHelperRect = new cc.Rect();
i.sEndPos = new cc.Vec2();
i.sOldChange = new cc.Vec2();
return i;
}(cc.Component);
t.ScrollPane = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(t) {
this._ownerBaseX = 0;
this._ownerBaseY = 0;
this._totalTimes = 0;
this._totalTasks = 0;
this._playing = !1;
this._paused = !1;
this._options = 0;
this._reversed = !1;
this._totalDuration = 0;
this._autoPlay = !1;
this._autoPlayTimes = 1;
this._autoPlayDelay = 0;
this._timeScale = 1;
this._startTime = 0;
this._endTime = 0;
this._owner = t;
this._items = new Array();
}
e.prototype.play = function(t, e, i, n, o) {
this._play(t, e, i, n, o, !1);
};
e.prototype.playReverse = function(t, e, i) {
this._play(t, e, i, 0, -1, !0);
};
e.prototype.changePlayTimes = function(t) {
this._totalTimes = t;
};
e.prototype.setAutoPlay = function(t, e, i) {
void 0 == e && (e = -1);
void 0 == i && (i = 0);
if (this._autoPlay != t) {
this._autoPlay = t;
this._autoPlayTimes = e;
this._autoPlayDelay = i;
this._autoPlay ? this._owner.onStage && this.play(null, this._autoPlayTimes, this._autoPlayDelay) : this._owner.onStage || this.stop(!1, !0);
}
};
e.prototype._play = function(e, n, o, r, s, a) {
void 0 == n && (n = 1);
void 0 == o && (o = 0);
void 0 == r && (r = 0);
void 0 == s && (s = -1);
this.stop(!0, !0);
this._totalTimes = n;
this._reversed = a;
this._startTime = r;
this._endTime = s;
this._playing = !0;
this._paused = !1;
this._onComplete = e;
for (var h = this._items.length, l = 0; l < h; l++) {
var c = this._items[l];
null == c.target ? c.targetId ? c.target = this._owner.getChildById(c.targetId) : c.target = this._owner : c.target != this._owner && c.target.parent != this._owner && (c.target = null);
if (null != c.target && c.type == i.Transition) {
var u = c.target.getTransition(c.value.transName);
u == this && (u = null);
if (null != u) if (0 == c.value.playTimes) {
var _;
for (_ = l - 1; _ >= 0; _--) {
var d = this._items[_];
if (d.type == i.Transition && d.value.trans == u) {
d.value.stopTime = c.time - d.time;
break;
}
}
_ < 0 ? c.value.stopTime = 0 : u = null;
} else c.value.stopTime = -1;
c.value.trans = u;
}
}
0 == o ? this.onDelayedPlay() : t.GTween.delayedCall(o).onComplete(this.onDelayedPlay, this);
};
e.prototype.stop = function(e, i) {
void 0 == e && (e = !0);
if (this._playing) {
this._playing = !1;
this._totalTasks = 0;
this._totalTimes = 0;
var n = this._onComplete;
this._onComplete = null;
t.GTween.kill(this);
var o = this._items.length;
if (this._reversed) for (var r = o - 1; r >= 0; r--) {
var s = this._items[r];
null != s.target && this.stopItem(s, e);
} else for (r = 0; r < o; r++) null != (s = this._items[r]).target && this.stopItem(s, e);
i && null != n && n();
}
};
e.prototype.stopItem = function(t, e) {
if (0 != t.displayLockToken) {
t.target.releaseDisplayLock(t.displayLockToken);
t.displayLockToken = 0;
}
if (null != t.tweener) {
t.tweener.kill(e);
t.tweener = null;
if (t.type == i.Shake && !e) {
t.target._gearLocked = !0;
t.target.setPosition(t.target.x - t.value.lastOffsetX, t.target.y - t.value.lastOffsetY);
t.target._gearLocked = !1;
}
}
if (t.type == i.Transition) {
var n = t.value.trans;
null != n && n.stop(e, !1);
}
};
e.prototype.setPaused = function(e) {
if (this._playing && this._paused != e) {
this._paused = e;
var n = t.GTween.getTween(this);
null != n && n.setPaused(e);
for (var o = this._items.length, r = 0; r < o; r++) {
var s = this._items[r];
if (null != s.target) {
if (s.type == i.Transition) null != s.value.trans && s.value.trans.setPaused(e); else if (s.type == i.Animation) if (e) {
s.value.flag = s.target.playing;
s.target.playing = !1;
} else s.target.playing = s.value.flag;
null != s.tweener && s.tweener.setPaused(e);
}
}
}
};
e.prototype.dispose = function() {
this._playing && t.GTween.kill(this);
for (var e = this._items.length, i = 0; i < e; i++) {
var n = this._items[i];
if (null != n.tweener) {
n.tweener.kill();
n.tweener = null;
}
n.target = null;
n.hook = null;
null != n.tweenConfig && (n.tweenConfig.endHook = null);
}
this._items.length = 0;
this._playing = !1;
this._onComplete = null;
};
Object.defineProperty(e.prototype, "playing", {
get: function() {
return this._playing;
},
enumerable: !0,
configurable: !0
});
e.prototype.setValue = function(t) {
for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
for (var o, r = this._items.length, s = 0; s < r; s++) {
var a = this._items[s];
if (a.label == t) o = null != a.tweenConfig ? a.tweenConfig.startValue : a.value; else {
if (null == a.tweenConfig || a.tweenConfig.endLabel != t) continue;
o = a.tweenConfig.endValue;
}
switch (a.type) {
case i.XY:
case i.Size:
case i.Pivot:
case i.Scale:
case i.Skew:
o.b1 = !0;
o.b2 = !0;
o.f1 = parseFloat(e[0]);
o.f2 = parseFloat(e[1]);
break;

case i.Alpha:
case i.Rotation:
case i.Color:
o.f1 = parseFloat(e[0]);
break;

case i.Animation:
o.frame = parseInt(e[0]);
e.length > 1 && (o.playing = e[1]);
break;

case i.Visible:
o.visible = e[0];
break;

case i.Sound:
o.sound = e[0];
e.length > 1 && (o.volume = parseFloat(e[1]));
break;

case i.Transition:
o.transName = e[0];
e.length > 1 && (o.playTimes = parseInt(e[1]));
break;

case i.Shake:
o.amplitude = parseFloat(e[0]);
e.length > 1 && (o.duration = parseFloat(e[1]));
break;

case i.ColorFilter:
o.f1 = parseFloat(e[0]);
o.f2 = parseFloat(e[1]);
o.f3 = parseFloat(e[2]);
o.f4 = parseFloat(e[3]);
break;

case i.Text:
case i.Icon:
o.text = e[0];
}
}
};
e.prototype.setHook = function(t, e) {
for (var i = this._items.length, n = 0; n < i; n++) {
var o = this._items[n];
if (o.label == t) {
o.hook = e;
break;
}
if (null != o.tweenConfig && o.tweenConfig.endLabel == t) {
o.tweenConfig.endHook = e;
break;
}
}
};
e.prototype.clearHooks = function() {
for (var t = this._items.length, e = 0; e < t; e++) {
var i = this._items[e];
i.hook = null;
null != i.tweenConfig && (i.tweenConfig.endHook = null);
}
};
e.prototype.setTarget = function(t, e) {
for (var i = this._items.length, n = 0; n < i; n++) {
var o = this._items[n];
if (o.label == t) {
o.targetId = e.id;
o.target = null;
}
}
};
e.prototype.setDuration = function(t, e) {
for (var i = this._items.length, n = 0; n < i; n++) {
var o = this._items[n];
null != o.tweenConfig && o.label == t && (o.tweenConfig.duration = e);
}
};
e.prototype.getLabelTime = function(t) {
for (var e = this._items.length, i = 0; i < e; i++) {
var n = this._items[i];
if (n.label == t) return n.time;
if (null != n.tweenConfig && n.tweenConfig.endLabel == t) return n.time + n.tweenConfig.duration;
}
return Number.NaN;
};
Object.defineProperty(e.prototype, "timeScale", {
get: function() {
return this._timeScale;
},
set: function(t) {
if (this._timeScale != t) {
this._timeScale = t;
if (this._playing) for (var e = this._items.length, n = 0; n < e; n++) {
var o = this._items[n];
null != o.tweener ? o.tweener.setTimeScale(t) : o.type == i.Transition ? null != o.value.trans && (o.value.trans.timeScale = t) : o.type == i.Animation && null != o.target && (o.target.timeScale = t);
}
}
},
enumerable: !0,
configurable: !0
});
e.prototype.updateFromRelations = function(t, e, n) {
var o = this._items.length;
if (0 != o) for (var r = 0; r < o; r++) {
var s = this._items[r];
if (s.type == i.XY && s.targetId == t) if (null != s.tweenConfig) {
s.tweenConfig.startValue.f1 += e;
s.tweenConfig.startValue.f2 += n;
s.tweenConfig.endValue.f1 += e;
s.tweenConfig.endValue.f2 += n;
} else {
s.value.f1 += e;
s.value.f2 += n;
}
}
};
e.prototype.onEnable = function() {
this._autoPlay && !this._playing && this.play(null, this._autoPlayTimes, this._autoPlayDelay);
};
e.prototype.onDisable = function() {
0 == (this._options & e.OPTION_AUTO_STOP_DISABLED) && this.stop(0 != (this._options & e.OPTION_AUTO_STOP_AT_END), !1);
};
e.prototype.onDelayedPlay = function() {
this.internalPlay();
this._playing = this._totalTasks > 0;
if (this._playing) {
if (0 != (this._options & e.OPTION_IGNORE_DISPLAY_CONTROLLER)) for (var t = this._items.length, i = 0; i < t; i++) {
var n = this._items[i];
null != n.target && n.target != this._owner && (n.displayLockToken = n.target.addDisplayLock());
}
} else if (null != this._onComplete) {
var o = this._onComplete;
this._onComplete = null;
o();
}
};
e.prototype.internalPlay = function() {
this._ownerBaseX = this._owner.x;
this._ownerBaseY = this._owner.y;
this._totalTasks = 0;
var t, e, n = this._items.length, o = !1;
if (this._reversed) for (e = n - 1; e >= 0; e--) null != (t = this._items[e]).target && this.playItem(t); else for (e = 0; e < n; e++) if (null != (t = this._items[e]).target) if (t.type == i.Animation && 0 != this._startTime && t.time <= this._startTime) {
o = !0;
t.value.flag = !1;
} else this.playItem(t);
o && this.skipAnimations();
};
e.prototype.playItem = function(e) {
var n;
if (null != e.tweenConfig) {
n = this._reversed ? this._totalDuration - e.time - e.tweenConfig.duration : e.time;
if (-1 == this._endTime || n <= this._endTime) {
var o, r;
if (this._reversed) {
o = e.tweenConfig.endValue;
r = e.tweenConfig.startValue;
} else {
o = e.tweenConfig.startValue;
r = e.tweenConfig.endValue;
}
e.value.b1 = o.b1 || r.b1;
e.value.b2 = o.b2 || r.b2;
switch (e.type) {
case i.XY:
case i.Size:
case i.Scale:
case i.Skew:
e.tweener = t.GTween.to2(o.f1, o.f2, r.f1, r.f2, e.tweenConfig.duration);
break;

case i.Alpha:
case i.Rotation:
e.tweener = t.GTween.to(o.f1, r.f1, e.tweenConfig.duration);
break;

case i.Color:
e.tweener = t.GTween.toColor(o.f1, r.f1, e.tweenConfig.duration);
break;

case i.ColorFilter:
e.tweener = t.GTween.to4(o.f1, o.f2, o.f3, o.f4, r.f1, r.f2, r.f3, r.f4, e.tweenConfig.duration);
}
e.tweener.setDelay(n).setEase(e.tweenConfig.easeType).setRepeat(e.tweenConfig.repeat, e.tweenConfig.yoyo).setTimeScale(this._timeScale).setTarget(e).onStart(this.onTweenStart, this).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
this._endTime >= 0 && e.tweener.setBreakpoint(this._endTime - n);
this._totalTasks++;
}
} else if (e.type == i.Shake) {
n = this._reversed ? this._totalDuration - e.time - e.value.duration : e.time;
e.value.offsetX = e.value.offsetY = 0;
e.value.lastOffsetX = e.value.lastOffsetY = 0;
e.tweener = t.GTween.shake(0, 0, e.value.amplitude, e.value.duration).setDelay(n).setTimeScale(this._timeScale).setTarget(e).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
this._endTime >= 0 && e.tweener.setBreakpoint(this._endTime - e.time);
this._totalTasks++;
} else if ((n = this._reversed ? this._totalDuration - e.time : e.time) <= this._startTime) {
this.applyValue(e);
this.callHook(e, !1);
} else if (-1 == this._endTime || n <= this._endTime) {
this._totalTasks++;
e.tweener = t.GTween.delayedCall(n).setTimeScale(this._timeScale).setTarget(e).onComplete(this.onDelayedPlayItem, this);
}
null != e.tweener && e.tweener.seek(this._startTime);
};
e.prototype.skipAnimations = function() {
for (var t, e, n, o, r, s, a = this._items.length, h = 0; h < a; h++) if (!((s = this._items[h]).type != i.Animation || s.time > this._startTime || (o = s.value).flag)) {
t = (r = s.target).frame;
e = r.playing ? 0 : -1;
n = 0;
for (var l = h; l < a; l++) if (!((s = this._items[l]).type != i.Animation || s.target != r || s.time > this._startTime)) {
(o = s.value).flag = !0;
if (-1 != o.frame) {
t = o.frame;
e = o.playing ? s.time : -1;
n = 0;
} else if (o.playing) e < 0 && (e = s.time); else {
e >= 0 && (n += s.time - e);
e = -1;
}
this.callHook(s, !1);
}
e >= 0 && (n += this._startTime - e);
r.playing = e >= 0;
r.frame = t;
n > 0 && r.advance(1e3 * n);
}
};
e.prototype.onDelayedPlayItem = function(t) {
var e = t.target;
e.tweener = null;
this._totalTasks--;
this.applyValue(e);
this.callHook(e, !1);
this.checkAllComplete();
};
e.prototype.onTweenStart = function(t) {
var e = t.target;
if (e.type == i.XY || e.type == i.Size) {
var n, o;
if (this._reversed) {
n = e.tweenConfig.endValue;
o = e.tweenConfig.startValue;
} else {
n = e.tweenConfig.startValue;
o = e.tweenConfig.endValue;
}
if (e.type == i.XY) if (e.target != this._owner) {
n.b1 || (n.f1 = e.target.x);
n.b2 || (n.f2 = e.target.y);
} else {
n.b1 || (n.f1 = e.target.x - this._ownerBaseX);
n.b2 || (n.f2 = e.target.y - this._ownerBaseY);
} else {
n.b1 || (n.f1 = e.target.width);
n.b2 || (n.f2 = e.target.height);
}
o.b1 || (o.f1 = n.f1);
o.b2 || (o.f2 = n.f2);
t.startValue.x = n.f1;
t.startValue.y = n.f2;
t.endValue.x = o.f1;
t.endValue.y = o.f2;
}
this.callHook(e, !1);
};
e.prototype.onTweenUpdate = function(t) {
var e = t.target;
switch (e.type) {
case i.XY:
case i.Size:
case i.Scale:
case i.Skew:
e.value.f1 = t.value.x;
e.value.f2 = t.value.y;
break;

case i.Alpha:
case i.Rotation:
e.value.f1 = t.value.x;
break;

case i.Color:
e.value.f1 = t.value.color;
break;

case i.ColorFilter:
e.value.f1 = t.value.x;
e.value.f2 = t.value.y;
e.value.f3 = t.value.z;
e.value.f4 = t.value.w;
break;

case i.Shake:
e.value.offsetX = t.deltaValue.x;
e.value.offsetY = t.deltaValue.y;
}
this.applyValue(e);
};
e.prototype.onTweenComplete = function(t) {
var e = t.target;
e.tweener = null;
this._totalTasks--;
t.allCompleted && this.callHook(e, !0);
this.checkAllComplete();
};
e.prototype.onPlayTransCompleted = function(t) {
this._totalTasks--;
this.checkAllComplete();
};
e.prototype.callHook = function(t, e) {
e ? null != t.tweenConfig && null != t.tweenConfig.endHook && t.tweenConfig.endHook(t.label) : t.time >= this._startTime && null != t.hook && t.hook(t.label);
};
e.prototype.checkAllComplete = function() {
if (this._playing && 0 == this._totalTasks) if (this._totalTimes < 0) this.internalPlay(); else {
this._totalTimes--;
if (this._totalTimes > 0) this.internalPlay(); else {
this._playing = !1;
for (var t = this._items.length, e = 0; e < t; e++) {
var i = this._items[e];
if (null != i.target && 0 != i.displayLockToken) {
i.target.releaseDisplayLock(i.displayLockToken);
i.displayLockToken = 0;
}
}
if (null != this._onComplete) {
var n = this._onComplete;
this._onComplete = null;
n();
}
}
}
};
e.prototype.applyValue = function(e) {
e.target._gearLocked = !0;
switch (e.type) {
case i.XY:
if (e.target == this._owner) {
var n, o;
n = e.value.b1 ? e.value.f1 + this._ownerBaseX : e.target.x;
o = e.value.b2 ? e.value.f2 + this._ownerBaseY : e.target.y;
e.target.setPosition(n, o);
} else {
e.value.b1 || (e.value.f1 = e.target.x);
e.value.b2 || (e.value.f2 = e.target.y);
e.target.setPosition(e.value.f1, e.value.f2);
}
break;

case i.Size:
e.value.b1 || (e.value.f1 = e.target.width);
e.value.b2 || (e.value.f2 = e.target.height);
e.target.setSize(e.value.f1, e.value.f2);
break;

case i.Pivot:
e.target.setPivot(e.value.f1, e.value.f2, e.target.pivotAsAnchor);
break;

case i.Alpha:
e.target.alpha = e.value.f1;
break;

case i.Rotation:
e.target.rotation = e.value.f1;
break;

case i.Scale:
e.target.setScale(e.value.f1, e.value.f2);
break;

case i.Skew:
e.target.setSkew(e.value.f1, e.value.f2);
break;

case i.Color:
e.target.color = e.value.f1;
break;

case i.Animation:
e.value.frame >= 0 && (e.target.frame = e.value.frame);
e.target.playing = e.value.playing;
e.target.timeScale = this._timeScale;
break;

case i.Visible:
e.target.visible = e.value.visible;
break;

case i.Transition:
if (this._playing) {
var r = e.value.trans;
if (null != r) {
this._totalTasks++;
var s = this._startTime > e.time ? this._startTime - e.time : 0, a = this._endTime >= 0 ? this._endTime - e.time : -1;
e.value.stopTime >= 0 && (a < 0 || a > e.value.stopTime) && (a = e.value.stopTime);
r.timeScale = this._timeScale;
r._play(function() {
this.onPlayTransCompleted(e);
}.bind(this), e.value.playTimes, 0, s, a, this._reversed);
}
}
break;

case i.Sound:
if (this._playing && e.time >= this._startTime) {
if (null == e.value.audioClip) {
var h = t.UIPackage.getItemByURL(e.value.sound);
h && (e.value.audioClip = h.owner.getItemAsset(h));
}
e.value.audioClip && t.GRoot.inst.playOneShotSound(e.value.audioClip, e.value.volume);
}
break;

case i.Shake:
e.target.setPosition(e.target.x - e.value.lastOffsetX + e.value.offsetX, e.target.y - e.value.lastOffsetY + e.value.offsetY);
e.value.lastOffsetX = e.value.offsetX;
e.value.lastOffsetY = e.value.offsetY;
break;

case i.ColorFilter:
break;

case i.Text:
e.target.text = e.value.text;
break;

case i.Icon:
e.target.icon = e.value.text;
}
e.target._gearLocked = !1;
};
e.prototype.setup = function(t) {
this.name = t.readS();
this._options = t.readInt();
this._autoPlay = t.readBool();
this._autoPlayTimes = t.readInt();
this._autoPlayDelay = t.readFloat();
for (var e = t.readShort(), i = 0; i < e; i++) {
var r = t.readShort(), s = t.position;
t.seek(s, 0);
var a = new n(t.readByte());
this._items[i] = a;
a.time = t.readFloat();
var h = t.readShort();
a.targetId = h < 0 ? "" : this._owner.getChildAt(h).id;
a.label = t.readS();
if (t.readBool()) {
t.seek(s, 1);
a.tweenConfig = new o();
a.tweenConfig.duration = t.readFloat();
a.time + a.tweenConfig.duration > this._totalDuration && (this._totalDuration = a.time + a.tweenConfig.duration);
a.tweenConfig.easeType = t.readByte();
a.tweenConfig.repeat = t.readInt();
a.tweenConfig.yoyo = t.readBool();
a.tweenConfig.endLabel = t.readS();
t.seek(s, 2);
this.decodeValue(a, t, a.tweenConfig.startValue);
t.seek(s, 3);
this.decodeValue(a, t, a.tweenConfig.endValue);
} else {
a.time > this._totalDuration && (this._totalDuration = a.time);
t.seek(s, 2);
this.decodeValue(a, t, a.value);
}
t.position = s + r;
}
};
e.prototype.decodeValue = function(t, e, n) {
switch (t.type) {
case i.XY:
case i.Size:
case i.Pivot:
case i.Skew:
n.b1 = e.readBool();
n.b2 = e.readBool();
n.f1 = e.readFloat();
n.f2 = e.readFloat();
break;

case i.Alpha:
case i.Rotation:
n.f1 = e.readFloat();
break;

case i.Scale:
n.f1 = e.readFloat();
n.f2 = e.readFloat();
break;

case i.Color:
n.f1 = e.readColor();
break;

case i.Animation:
n.playing = e.readBool();
n.frame = e.readInt();
break;

case i.Visible:
n.visible = e.readBool();
break;

case i.Sound:
n.sound = e.readS();
n.volume = e.readFloat();
break;

case i.Transition:
n.transName = e.readS();
n.playTimes = e.readInt();
break;

case i.Shake:
n.amplitude = e.readFloat();
n.duration = e.readFloat();
break;

case i.ColorFilter:
n.f1 = e.readFloat();
n.f2 = e.readFloat();
n.f3 = e.readFloat();
n.f4 = e.readFloat();
break;

case i.Text:
case i.Icon:
n.text = e.readS();
}
};
e.OPTION_IGNORE_DISPLAY_CONTROLLER = 1;
e.OPTION_AUTO_STOP_DISABLED = 2;
e.OPTION_AUTO_STOP_AT_END = 4;
return e;
}();
t.Transition = e;
var i = function() {
function t() {}
t.XY = 0;
t.Size = 1;
t.Scale = 2;
t.Pivot = 3;
t.Alpha = 4;
t.Rotation = 5;
t.Color = 6;
t.Animation = 7;
t.Visible = 8;
t.Sound = 9;
t.Transition = 10;
t.Shake = 11;
t.ColorFilter = 12;
t.Skew = 13;
t.Text = 14;
t.Icon = 15;
t.Unknown = 16;
return t;
}(), n = function() {
return function(t) {
this.type = t;
switch (t) {
case i.XY:
case i.Size:
case i.Scale:
case i.Pivot:
case i.Skew:
case i.Alpha:
case i.Rotation:
case i.Color:
case i.ColorFilter:
this.value = new u();
break;

case i.Animation:
this.value = new s();
break;

case i.Shake:
this.value = new l();
break;

case i.Sound:
this.value = new a();
break;

case i.Transition:
this.value = new h();
break;

case i.Visible:
this.value = new r();
break;

case i.Text:
case i.Icon:
this.value = new c();
}
};
}(), o = function() {
return function() {
this.duration = 0;
this.repeat = 0;
this.yoyo = !1;
this.easeType = t.EaseType.QuadOut;
this.startValue = new u();
this.endValue = new u();
};
}(), r = function() {
return function() {};
}(), s = function() {
return function() {};
}(), a = function() {
return function() {};
}(), h = function() {
return function() {};
}(), l = function() {
return function() {};
}(), c = function() {
return function() {};
}(), u = function() {
return function() {
this.f1 = this.f2 = this.f3 = this.f4 = 0;
this.b1 = this.b2 = !0;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.loadFromXML = function(t) {
e.strings = {};
for (var i = new cc.SAXParser().parse(t).documentElement.childNodes, n = i.length, o = 0; o < n; o++) {
var r = i[o];
if ("string" == r.tagName) {
var s = r.getAttribute("name"), a = r.childNodes.length > 0 ? r.firstChild.nodeValue : "", h = s.indexOf("-");
if (-1 == h) continue;
var l = s.substr(0, h), c = s.substr(h + 1), u = e.strings[l];
if (!u) {
u = {};
e.strings[l] = u;
}
u[c] = a;
}
}
};
e.translateComponent = function(i) {
if (null != e.strings) {
var n = e.strings[i.owner.id + i.id];
if (null != n) {
var o, r, s, a, h, l, c, u, _, d, p = i.rawData;
p.seek(0, 2);
var f = p.readShort();
for (h = 0; h < f; h++) {
u = p.readShort();
_ = p.position;
p.seek(_, 0);
var g = p.readByte();
p.skip(4);
o = p.readS();
g == t.ObjectType.Component && p.seek(_, 6) && (g = p.readByte());
p.seek(_, 1);
null != (r = n[o + "-tips"]) && p.writeS(r);
p.seek(_, 2);
var y = p.readShort();
for (l = 0; l < y; l++) {
s = p.readShort();
s += p.position;
if (6 == p.readByte()) {
p.skip(2);
d = p.readShort();
for (c = 0; c < d; c++) null != p.readS() && (null != (r = n[o + "-texts_" + c]) ? p.writeS(r) : p.skip(2));
p.readBool() && null != (r = n[o + "-texts_def"]) && p.writeS(r);
}
p.position = s;
}
switch (g) {
case t.ObjectType.Text:
case t.ObjectType.RichText:
case t.ObjectType.InputText:
if (null != (r = n[o])) {
p.seek(_, 6);
p.writeS(r);
}
if (null != (r = n[o + "-prompt"])) {
p.seek(_, 4);
p.writeS(r);
}
break;

case t.ObjectType.List:
p.seek(_, 8);
p.skip(2);
a = p.readShort();
for (l = 0; l < a; l++) {
s = p.readShort();
s += p.position;
p.skip(2);
null != (r = n[o + "-" + l]) ? p.writeS(r) : p.skip(2);
null != (r = n[o + "-" + l + "-0"]) && p.writeS(r);
p.position = s;
}
break;

case t.ObjectType.Label:
if (p.seek(_, 6) && p.readByte() == g) {
null != (r = n[o]) ? p.writeS(r) : p.skip(2);
p.skip(2);
p.readBool() && p.skip(4);
p.skip(4);
p.readBool() && null != (r = n[o + "-prompt"]) && p.writeS(r);
}
break;

case t.ObjectType.Button:
if (p.seek(_, 6) && p.readByte() == g) {
null != (r = n[o]) ? p.writeS(r) : p.skip(2);
null != (r = n[o + "-0"]) && p.writeS(r);
}
break;

case t.ObjectType.ComboBox:
if (p.seek(_, 6) && p.readByte() == g) {
a = p.readShort();
for (l = 0; l < a; l++) {
s = p.readShort();
s += p.position;
null != (r = n[o + "-" + l]) && p.writeS(r);
p.position = s;
}
null != (r = n[o]) && p.writeS(r);
}
}
p.position = _ + u;
}
}
}
};
e.strings = null;
return e;
}();
t.TranslationHelper = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.defaultFont = "Arial";
e.modalLayerColor = new cc.Color(51, 51, 51, 51);
e.buttonSoundVolumeScale = 1;
e.defaultScrollStep = 25;
e.defaultScrollDecelerationRate = .967;
e.defaultScrollBarDisplay = t.ScrollBarDisplayType.Visible;
e.defaultScrollTouchEffect = !0;
e.defaultScrollBounceEffect = !0;
e.defaultComboBoxVisibleItemCount = 10;
e.touchScrollSensitivity = 20;
e.touchDragSensitivity = 10;
e.clickDragSensitivity = 2;
e.bringWindowToFrontOnClick = !0;
e.frameTimeForAsyncUIConstruction = .002;
e.linkUnderline = !0;
e.defaultUIGroup = "UI";
return e;
}();
t.UIConfig = e;
var i = !1;
t.addLoadHandler = function(t) {
var e, n;
if (!i) {
i = !0;
t || (t = "bin");
cc.loader.addDownloadHandlers(((e = {})[t] = cc.loader.downloader.extMap.binary, 
e));
cc.loader.addLoadHandlers(((n = {})[t] = function(t, e) {
t._owner.rawBuffer = t.content;
return t.content;
}, n));
}
};
var n = {};
t.registerFont = function(t, e) {
e instanceof cc.Font ? n[t] = e : n[t] = cc.loader.getRes(t, cc.Font);
};
t.getFontByName = function(t) {
return n[t];
};
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.setPackageItemExtension = function(t, i) {
e.setExtension(t, i);
};
e.setExtension = function(i, n) {
if (null == i) throw "Invaild url: " + i;
var o = t.UIPackage.getItemByURL(i);
null != o && (o.extensionType = n);
e.extensions[i] = n;
};
e.setLoaderExtension = function(t) {
e.loaderType = t;
};
e.resolveExtension = function(t) {
t.extensionType = e.extensions["ui://" + t.owner.id + t.id];
t.extensionType || (t.extensionType = e.extensions["ui://" + t.owner.name + "/" + t.name]);
};
e.newObject = function(t) {
return null != t.extensionType ? new t.extensionType() : this.newObject2(t.objectType);
};
e.newObject2 = function(i) {
switch (i) {
case t.ObjectType.Image:
return new t.GImage();

case t.ObjectType.MovieClip:
return new t.GMovieClip();

case t.ObjectType.Component:
return new t.GComponent();

case t.ObjectType.Text:
return new t.GTextField();

case t.ObjectType.RichText:
return new t.GRichTextField();

case t.ObjectType.InputText:
return new t.GTextInput();

case t.ObjectType.Group:
return new t.GGroup();

case t.ObjectType.List:
return new t.GList();

case t.ObjectType.Graph:
return new t.GGraph();

case t.ObjectType.Loader:
return null != e.loaderType ? new e.loaderType() : new t.GLoader();

case t.ObjectType.Button:
return new t.GButton();

case t.ObjectType.Label:
return new t.GLabel();

case t.ObjectType.ProgressBar:
return new t.GProgressBar();

case t.ObjectType.Slider:
return new t.GSlider();

case t.ObjectType.ScrollBar:
return new t.GScrollBar();

case t.ObjectType.ComboBox:
return new t.GComboBox();

default:
return null;
}
};
e.extensions = {};
return e;
}();
t.UIObjectFactory = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {
this._items = new Array();
this._itemsById = {};
this._itemsByName = {};
this._sprites = {};
}
e.getById = function(t) {
return e._instById[t];
};
e.getByName = function(t) {
return e._instByName[t];
};
e.addPackage = function(i) {
var n = e._instById[i];
if (n) return n;
var o = cc.loader.getRes(i);
if (!o) throw "Resource '" + i + "' not ready";
if (!o.rawBuffer) throw "Missing asset data. Call UIConfig.registerLoader first!";
(n = new e()).loadPackage(new t.ByteBuffer(o.rawBuffer), i);
e._instById[n.id] = n;
e._instByName[n.name] = n;
e._instById[n._url] = n;
return n;
};
e.loadPackage = function(i, n) {
cc.loader.loadRes(i, function(o, r) {
if (o) n(o); else {
if (!r.rawBuffer) throw "Missing asset data. Call UIConfig.registerLoader first!";
var s = new e();
s.loadPackage(new t.ByteBuffer(r.rawBuffer), i);
for (var a = s._items.length, h = [], l = 0; l < a; l++) {
var c = s._items[l];
c.type != t.PackageItemType.Atlas && c.type != t.PackageItemType.Sound || h.push(c.file);
}
cc.loader.loadResArray(h, function(t, i) {
if (!t) {
e._instById[s.id] = s;
e._instByName[s.name] = s;
}
n(t);
});
}
});
};
e.removePackage = function(t) {
var i = e._instById[t];
i || (i = e._instByName[t]);
if (!i) throw "No package found: " + t;
i.dispose();
delete e._instById[i.id];
null != i._url && delete e._instById[i._url];
delete e._instByName[i.name];
};
e.createObject = function(t, i, n) {
void 0 === n && (n = null);
var o = e.getByName(t);
return o ? o.createObject(i, n) : null;
};
e.createObjectFromURL = function(t, i) {
void 0 === i && (i = null);
var n = e.getItemByURL(t);
return n ? n.owner.internalCreateObject(n, i) : null;
};
e.getItemURL = function(t, i) {
var n = e.getByName(t);
if (!n) return null;
var o = n._itemsByName[i];
return o ? "ui://" + n.id + o.id : null;
};
e.getItemByURL = function(t) {
var i = t.indexOf("//");
if (-1 == i) return null;
var n = t.indexOf("/", i + 2);
if (-1 == n) {
if (t.length > 13) {
var o = t.substr(5, 8), r = e.getById(o);
if (null != r) {
var s = t.substr(13);
return r.getItemById(s);
}
}
} else {
var a = t.substr(i + 2, n - i - 2);
if (null != (r = e.getByName(a))) {
var h = t.substr(n + 1);
return r.getItemByName(h);
}
}
return null;
};
e.normalizeURL = function(t) {
if (null == t) return null;
var i = t.indexOf("//");
if (-1 == i) return null;
var n = t.indexOf("/", i + 2);
if (-1 == n) return t;
var o = t.substr(i + 2, n - i - 2), r = t.substr(n + 1);
return e.getItemURL(o, r);
};
e.setStringsSource = function(e) {
t.TranslationHelper.loadFromXML(e);
};
e.prototype.loadPackage = function(e, n) {
if (1179080009 != e.readUint()) throw "FairyGUI: old package format found in '" + n + "'";
this._url = n;
e.version = e.readInt();
e.readBool();
this._id = e.readString();
this._name = e.readString();
e.skip(20);
var o, r, s, a = e.position;
e.seek(a, 4);
o = e.readInt();
var h, l = new Array(o);
e.stringTable = l;
for (r = 0; r < o; r++) l[r] = e.readString();
if (e.seek(a, 5)) {
o = e.readInt();
for (r = 0; r < o; r++) {
var c = e.readUshort(), u = e.readInt();
l[c] = e.readString(u);
}
}
e.seek(a, 1);
n += "_";
o = e.readShort();
for (r = 0; r < o; r++) {
s = e.readInt();
s += e.position;
(h = new t.PackageItem()).owner = this;
h.type = e.readByte();
h.id = e.readS();
h.name = e.readS();
e.readS();
h.file = e.readS();
e.readBool();
h.width = e.readInt();
h.height = e.readInt();
switch (h.type) {
case t.PackageItemType.Image:
h.objectType = t.ObjectType.Image;
var _ = e.readByte();
if (1 == _) {
h.scale9Grid = new cc.Rect();
h.scale9Grid.x = e.readInt();
h.scale9Grid.y = e.readInt();
h.scale9Grid.width = e.readInt();
h.scale9Grid.height = e.readInt();
h.tileGridIndice = e.readInt();
} else 2 == _ && (h.scaleByTile = !0);
h.smoothing = e.readBool();
break;

case t.PackageItemType.MovieClip:
h.smoothing = e.readBool();
h.objectType = t.ObjectType.MovieClip;
h.rawData = e.readBuffer();
break;

case t.PackageItemType.Font:
h.rawData = e.readBuffer();
break;

case t.PackageItemType.Component:
var d = e.readByte();
h.objectType = d > 0 ? d : t.ObjectType.Component;
h.rawData = e.readBuffer();
t.UIObjectFactory.resolveExtension(h);
break;

case t.PackageItemType.Atlas:
case t.PackageItemType.Sound:
case t.PackageItemType.Misc:
h.file = n + cc.path.mainFileName(h.file);
}
this._items.push(h);
this._itemsById[h.id] = h;
null != h.name && (this._itemsByName[h.name] = h);
e.position = s;
}
e.seek(a, 2);
o = e.readShort();
for (r = 0; r < o; r++) {
s = e.readShort();
s += e.position;
var p = e.readS();
h = this._itemsById[e.readS()];
var f = new i();
f.atlas = h;
f.rect.x = e.readInt();
f.rect.y = e.readInt();
f.rect.width = e.readInt();
f.rect.height = e.readInt();
f.rotated = e.readBool();
this._sprites[p] = f;
e.position = s;
}
if (e.seek(a, 3)) {
o = e.readShort();
for (r = 0; r < o; r++) {
s = e.readInt();
s += e.position;
(h = this._itemsById[e.readS()]) && h.type == t.PackageItemType.Image && (h.hitTestData = new t.PixelHitTestData(e));
e.position = s;
}
}
e.seek(a, 0);
o = e.readShort();
this.dependencies = {};
for (r = 0; r < o; r++) {
var g = {};
g.id = e.readS();
g.name = e.readS();
this.dependencies[r] = g;
}
};
e.prototype.dispose = function() {
for (var t = this._items.length, e = 0; e < t; e++) {
var i = this._items[e];
i.asset && cc.loader.releaseAsset(i.asset);
}
};
Object.defineProperty(e.prototype, "id", {
get: function() {
return this._id;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "name", {
get: function() {
return this._name;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "url", {
get: function() {
return this._url;
},
enumerable: !0,
configurable: !0
});
e.prototype.createObject = function(t, e) {
void 0 === e && (e = null);
var i = this._itemsByName[t];
return i ? this.internalCreateObject(i, e) : null;
};
e.prototype.internalCreateObject = function(i, n) {
void 0 === n && (n = null);
var o;
if (null == (o = i.type == t.PackageItemType.Component && null != n ? new n() : t.UIObjectFactory.newObject(i))) return null;
e._constructing++;
o.packageItem = i;
o.constructFromResource();
e._constructing--;
return o;
};
e.prototype.getItemById = function(t) {
return this._itemsById[t];
};
e.prototype.getItemByName = function(t) {
return this._itemsByName[t];
};
e.prototype.getItemAssetByName = function(t) {
var e = this._itemsByName[t];
if (null == e) throw "Resource not found -" + t;
return this.getItemAsset(e);
};
e.prototype.getItemAsset = function(e) {
switch (e.type) {
case t.PackageItemType.Image:
if (!e.decoded) {
e.decoded = !0;
var i = this._sprites[e.id];
if (null != i) {
var n = this.getItemAsset(i.atlas);
if (null != n) {
var o = new cc.SpriteFrame(n, i.rect, i.rotated, cc.Vec2.ZERO, i.rect.size);
if (e.scale9Grid) {
o.insetLeft = e.scale9Grid.x;
o.insetTop = e.scale9Grid.y;
o.insetRight = e.width - e.scale9Grid.xMax;
o.insetBottom = e.height - e.scale9Grid.yMax;
}
e.asset = o;
}
}
}
return e.asset;

case t.PackageItemType.Atlas:
case t.PackageItemType.Sound:
if (!e.decoded) {
e.decoded = !0;
e.asset = cc.loader.getRes(e.file);
e.asset || console.log("Resource '" + e.file + "' not found, please check default.res.json!");
}
return e.asset;

case t.PackageItemType.Font:
if (!e.decoded) {
e.decoded = !0;
this.loadFont(e);
}
return e.asset;

case t.PackageItemType.MovieClip:
if (!e.decoded) {
e.decoded = !0;
this.loadMovieClip(e);
}
return null;

case t.PackageItemType.Misc:
return e.file ? cc.loader.getRes(e.file) : null;

default:
return null;
}
};
e.prototype.loadAllAssets = function() {
for (var t = this._items.length, e = 0; e < t; e++) {
var i = this._items[e];
this.getItemAsset(i);
}
};
e.prototype.loadMovieClip = function(e) {
var i = e.rawData;
i.seek(0, 0);
e.interval = i.readInt() / 1e3;
e.swing = i.readBool();
e.repeatDelay = i.readInt() / 1e3;
i.seek(0, 1);
var n, o, r, s = i.readShort();
e.frames = Array(s);
for (var a = 0; a < s; a++) {
var h = i.readShort();
h += i.position;
(o = new t.Frame()).rect.x = i.readInt();
o.rect.y = i.readInt();
o.rect.width = i.readInt();
o.rect.height = i.readInt();
o.addDelay = i.readInt() / 1e3;
if (null != (n = i.readS()) && null != (r = this._sprites[n])) {
var l = this.getItemAsset(r.atlas);
if (null != l) {
e.width, o.rect.width;
o.texture = new cc.SpriteFrame(l, r.rect, r.rotated, new cc.Vec2(o.rect.x - (e.width - o.rect.width) / 2, -(o.rect.y - (e.height - o.rect.height) / 2)), new cc.Size(e.width, e.height));
}
}
e.frames[a] = o;
i.position = h;
}
};
e.prototype.loadFont = function(t) {
var e = new cc.LabelAtlas();
t.asset = e;
e._fntConfig = {
commonHeight: 0,
fontSize: 0,
kerningDict: {},
fontDefDictionary: {}
};
var i = e._fntConfig.fontDefDictionary, n = t.rawData;
n.seek(0, 0);
var o = n.readBool(), r = n.readBool(), s = n.readBool();
n.readBool();
var a, h = n.readInt(), l = n.readInt(), c = n.readInt(), u = this._sprites[t.id];
null != u && (a = this.getItemAsset(u.atlas));
n.seek(0, 1);
for (var _ = null, d = n.readInt(), p = 0; p < d; p++) {
var f = n.readShort();
f += n.position;
_ = {};
i[n.readUshort()] = _;
var g = new cc.Rect();
_.rect = g;
var y = n.readS();
g.x = n.readInt();
g.y = n.readInt();
_.xOffset = n.readInt();
_.yOffset = n.readInt();
g.width = n.readInt();
g.height = n.readInt();
_.xAdvance = n.readInt();
_.channel = n.readByte();
1 == _.channel ? _.channel = 3 : 2 == _.channel ? _.channel = 2 : 3 == _.channel && (_.channel = 1);
if (o) {
g.x += u.rect.x;
g.y += u.rect.y;
} else {
var m = this._sprites[y];
if (m) {
g.set(m.rect);
0 == h && (h = g.height);
if (!a) {
m.atlas.load();
a = m.atlas.asset;
}
}
}
o || 0 == _.xAdvance && (_.xAdvance = 0 == l ? _.xOffset + _.rect.width : l);
n.position = f;
}
e.fontSize = h;
e._fntConfig.fontSize = h;
e._fntConfig.commonHeight = 0 == c ? h : c;
e._fntConfig.resizable = s;
e._fntConfig.canTint = r;
var b = new cc.SpriteFrame();
b.setTexture(a);
e.spriteFrame = b;
};
e._constructing = 0;
e._instById = {};
e._instByName = {};
return e;
}();
t.UIPackage = e;
var i = function() {
return function() {
this.rect = new cc.Rect();
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._requestingCmd = 0;
i._uiSources = new Array();
i.bringToFontOnClick = t.UIConfig.bringWindowToFrontOnClick;
i._node.on(t.Event.TOUCH_BEGIN, i.onTouchBegin_1, i, !0);
return i;
}
i.prototype.addUISource = function(t) {
this._uiSources.push(t);
};
Object.defineProperty(i.prototype, "contentPane", {
get: function() {
return this._contentPane;
},
set: function(e) {
if (this._contentPane != e) {
null != this._contentPane && this.removeChild(this._contentPane);
this._contentPane = e;
if (null != this._contentPane) {
this.addChild(this._contentPane);
this.setSize(this._contentPane.width, this._contentPane.height);
this._contentPane.addRelation(this, t.RelationType.Size);
this._frame = this._contentPane.getChild("frame");
if (null != this._frame) {
this.closeButton = this._frame.getChild("closeButton");
this.dragArea = this._frame.getChild("dragArea");
this.contentArea = this._frame.getChild("contentArea");
}
}
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "frame", {
get: function() {
return this._frame;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "closeButton", {
get: function() {
return this._closeButton;
},
set: function(t) {
null != this._closeButton && this._closeButton.offClick(this.closeEventHandler, this);
this._closeButton = t;
null != this._closeButton && this._closeButton.onClick(this.closeEventHandler, this);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "dragArea", {
get: function() {
return this._dragArea;
},
set: function(e) {
if (this._dragArea != e) {
if (null != this._dragArea) {
this._dragArea.draggable = !1;
this._dragArea.off(t.Event.DRAG_START, this.onDragStart_1, this);
}
this._dragArea = e;
if (null != this._dragArea) {
this._dragArea.draggable = !0;
this._dragArea.on(t.Event.DRAG_START, this.onDragStart_1, this);
}
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "contentArea", {
get: function() {
return this._contentArea;
},
set: function(t) {
this._contentArea = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.show = function() {
t.GRoot.inst.showWindow(this);
};
i.prototype.showOn = function(t) {
t.showWindow(this);
};
i.prototype.hide = function() {
this.isShowing && this.doHideAnimation();
};
i.prototype.hideImmediately = function() {
var e = this.parent instanceof t.GRoot ? this.parent : null;
e || (e = t.GRoot.inst);
e.hideWindowImmediately(this);
};
i.prototype.centerOn = function(e, i) {
this.setPosition(Math.round((e.width - this.width) / 2), Math.round((e.height - this.height) / 2));
if (i) {
this.addRelation(e, t.RelationType.Center_Center);
this.addRelation(e, t.RelationType.Middle_Middle);
}
};
i.prototype.toggleStatus = function() {
this.isTop ? this.hide() : this.show();
};
Object.defineProperty(i.prototype, "isShowing", {
get: function() {
return null != this.parent;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "isTop", {
get: function() {
return null != this.parent && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "modal", {
get: function() {
return this._modal;
},
set: function(t) {
this._modal = t;
},
enumerable: !0,
configurable: !0
});
i.prototype.bringToFront = function() {
this.root.bringToFront(this);
};
i.prototype.showModalWait = function(e) {
void 0 != e && (this._requestingCmd = e);
if (t.UIConfig.windowModalWaiting) {
this._modalWaitPane || (this._modalWaitPane = t.UIPackage.createObjectFromURL(t.UIConfig.windowModalWaiting));
this.layoutModalWaitPane();
this.addChild(this._modalWaitPane);
}
};
i.prototype.layoutModalWaitPane = function() {
if (null != this._contentArea) {
var t = this._frame.localToGlobal();
t = this.globalToLocal(t.x, t.y, t);
this._modalWaitPane.setPosition(t.x + this._contentArea.x, t.y + this._contentArea.y);
this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
} else this._modalWaitPane.setSize(this.width, this.height);
};
i.prototype.closeModalWait = function(t) {
void 0 === t && (t = 0);
if (0 != t && this._requestingCmd != t) return !1;
this._requestingCmd = 0;
this._modalWaitPane && null != this._modalWaitPane.parent && this.removeChild(this._modalWaitPane);
return !0;
};
Object.defineProperty(i.prototype, "modalWaiting", {
get: function() {
return this._modalWaitPane && null != this._modalWaitPane.parent;
},
enumerable: !0,
configurable: !0
});
i.prototype.init = function() {
if (!this._inited && !this._loading) if (this._uiSources.length > 0) {
this._loading = !1;
for (var t = this._uiSources.length, e = 0; e < t; e++) {
var i = this._uiSources[e];
if (!i.loaded) {
i.load(this.__uiLoadComplete, this);
this._loading = !0;
}
}
this._loading || this._init();
} else this._init();
};
i.prototype.onInit = function() {};
i.prototype.onShown = function() {};
i.prototype.onHide = function() {};
i.prototype.doShowAnimation = function() {
this.onShown();
};
i.prototype.doHideAnimation = function() {
this.hideImmediately();
};
i.prototype.__uiLoadComplete = function() {
for (var t = this._uiSources.length, e = 0; e < t; e++) {
if (!this._uiSources[e].loaded) return;
}
this._loading = !1;
this._init();
};
i.prototype._init = function() {
this._inited = !0;
this.onInit();
this.isShowing && this.doShowAnimation();
};
i.prototype.dispose = function() {
null != this.parent && this.hideImmediately();
e.prototype.dispose.call(this);
};
i.prototype.closeEventHandler = function(t) {
this.hide();
};
i.prototype.onEnable = function() {
e.prototype.onEnable.call(this);
this._inited ? this.doShowAnimation() : this.init();
};
i.prototype.onDisable = function() {
e.prototype.onDisable.call(this);
this.closeModalWait();
this.onHide();
};
i.prototype.onTouchBegin_1 = function(t) {
this.isShowing && this.bringToFontOnClick && this.bringToFront();
};
i.prototype.onDragStart_1 = function(e) {
t.GObject.cast(e.currentTarget).stopDrag();
this.startDrag(e.touchId);
};
return i;
}(t.GComponent);
t.Window = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.createAction = function(e) {
switch (e) {
case 0:
return new t.PlayTransitionAction();

case 1:
return new t.ChangePageAction();
}
return null;
};
e.prototype.run = function(t, e, i) {
null != this.fromPage && 0 != this.fromPage.length && -1 == this.fromPage.indexOf(e) || null != this.toPage && 0 != this.toPage.length && -1 == this.toPage.indexOf(i) ? this.leave(t) : this.enter(t);
};
e.prototype.enter = function(t) {};
e.prototype.leave = function(t) {};
e.prototype.setup = function(t) {
var e, i;
e = t.readShort();
this.fromPage = [];
for (i = 0; i < e; i++) this.fromPage[i] = t.readS();
e = t.readShort();
this.toPage = [];
for (i = 0; i < e; i++) this.toPage[i] = t.readS();
};
return e;
}();
t.ControllerAction = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
return e.call(this) || this;
}
i.prototype.enter = function(e) {
if (this.controllerName) {
var i;
if (this.objectId) {
var n = e.parent.getChildById(this.objectId);
if (!(n instanceof t.GComponent)) return;
i = n;
} else i = e.parent;
if (i) {
var o = i.getController(this.controllerName);
o && o != e && !o.changing && (o.selectedPageId = this.targetPage);
}
}
};
i.prototype.setup = function(t) {
e.prototype.setup.call(this, t);
this.objectId = t.readS();
this.controllerName = t.readS();
this.targetPage = t.readS();
};
return i;
}(t.ControllerAction);
t.ChangePageAction = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e() {
var e = t.call(this) || this;
e.playTimes = 1;
e.delay = 0;
e.stopOnExit = !1;
return e;
}
e.prototype.enter = function(t) {
var e = t.parent.getTransition(this.transitionName);
if (e) {
this._currentTransition && this._currentTransition.playing ? e.changePlayTimes(this.playTimes) : e.play(null, this.playTimes, this.delay);
this._currentTransition = e;
}
};
e.prototype.leave = function(t) {
if (this.stopOnExit && this._currentTransition) {
this._currentTransition.stop();
this._currentTransition = null;
}
};
e.prototype.setup = function(e) {
t.prototype.setup.call(this, e);
this.transitionName = e.readS();
this.playTimes = e.readInt();
this.delay = e.readFloat();
this.stopOnExit = e.readBool();
};
return e;
}(t.ControllerAction);
t.PlayTransitionAction = e;
})(fgui || (fgui = {}));

(function(t) {
(function(t) {
t[t.Normal = 0] = "Normal";
t[t.None = 1] = "None";
t[t.Add = 2] = "Add";
t[t.Multiply = 3] = "Multiply";
t[t.Screen = 4] = "Screen";
t[t.Erase = 5] = "Erase";
t[t.Mask = 6] = "Mask";
t[t.Below = 7] = "Below";
t[t.Off = 8] = "Off";
t[t.Custom1 = 9] = "Custom1";
t[t.Custom2 = 10] = "Custom2";
t[t.Custom3 = 11] = "Custom3";
})(t.BlendMode || (t.BlendMode = {}));
var e = function() {
function t() {}
t.apply = function(e, i) {
var n = e.getComponent(cc.RenderComponent);
if (n) {
var o = t.factors[i];
n.srcBlendFactor = o[0];
n.dstBlendFactor = o[1];
}
};
t.override = function(e, i, n) {
t.factors[e][0] = i;
t.factors[e][1] = n;
};
t.factors = [ [ cc.macro.SRC_ALPHA, cc.macro.ONE_MINUS_SRC_ALPHA ], [ cc.macro.ONE, cc.macro.ONE ], [ cc.macro.SRC_ALPHA, cc.macro.ONE ], [ cc.macro.DST_COLOR, cc.macro.ONE_MINUS_SRC_ALPHA ], [ cc.macro.ONE, cc.macro.ONE_MINUS_SRC_COLOR ], [ cc.macro.ZERO, cc.macro.ONE_MINUS_SRC_ALPHA ], [ cc.macro.ZERO, cc.macro.SRC_ALPHA ], [ cc.macro.ONE_MINUS_DST_ALPHA, cc.macro.DST_ALPHA ], [ cc.macro.ONE, cc.macro.ZERO ], [ cc.macro.SRC_ALPHA, cc.macro.ONE_MINUS_SRC_ALPHA ], [ cc.macro.SRC_ALPHA, cc.macro.ONE_MINUS_SRC_ALPHA ], [ cc.macro.SRC_ALPHA, cc.macro.ONE_MINUS_SRC_ALPHA ] ];
return t;
}();
t.BlendModeUtils = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i() {
var i = e.call(this) || this;
i._flip = t.FlipType.None;
i._fillMethod = t.FillMethod.None;
i._fillOrigin = t.FillOrigin.Left;
i._fillAmount = 0;
i._fillClockwise = !1;
i.sizeMode = cc.Sprite.SizeMode.CUSTOM;
i.trim = !1;
return i;
}
Object.defineProperty(i.prototype, "flip", {
get: function() {
return this._flip;
},
set: function(e) {
if (this._flip != e) {
this._flip = e;
var i = 1, n = 1;
this._flip != t.FlipType.Horizontal && this._flip != t.FlipType.Both || (i = -1);
this._flip != t.FlipType.Vertical && this._flip != t.FlipType.Both || (n = -1);
1 == i && 1 == n || this.node.setAnchorPoint(.5, .5);
this.node.setScale(i, n);
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillMethod", {
get: function() {
return this._fillMethod;
},
set: function(t) {
if (this._fillMethod != t) {
this._fillMethod = t;
if (0 != this._fillMethod) {
this.type = cc.Sprite.Type.FILLED;
this._fillMethod <= 3 ? this.fillType = this._fillMethod - 1 : this.fillType = cc.Sprite.FillType.RADIAL;
this.fillCenter = new cc.Vec2(.5, .5);
this.setupFill();
} else this.type = cc.Sprite.Type.SIMPLE;
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillOrigin", {
get: function() {
return this._fillOrigin;
},
set: function(t) {
if (this._fillOrigin != t) {
this._fillOrigin = t;
0 != this._fillMethod && this.setupFill();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillClockwise", {
get: function() {
return this._fillClockwise;
},
set: function(t) {
if (this._fillClockwise != t) {
this._fillClockwise = t;
0 != this._fillMethod && this.setupFill();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "fillAmount", {
get: function() {
return this._fillAmount;
},
set: function(t) {
if (this._fillAmount != t) {
this._fillAmount = t;
0 != this._fillMethod && (this._fillClockwise ? this.fillRange = -this._fillAmount : this.fillRange = this._fillAmount);
}
},
enumerable: !0,
configurable: !0
});
i.prototype.setupFill = function() {
if (this._fillMethod == t.FillMethod.Horizontal || this._fillMethod == t.FillMethod.Vertical) {
this._fillClockwise = this._fillOrigin == t.FillOrigin.Right || this._fillOrigin == t.FillOrigin.Bottom;
this.fillStart = this._fillClockwise ? 1 : 0;
} else {
switch (this._fillOrigin) {
case t.FillOrigin.Right:
this.fillOrigin = 0;
break;

case t.FillOrigin.Top:
this.fillStart = .25;
break;

case t.FillOrigin.Left:
this.fillStart = .5;
break;

case t.FillOrigin.Bottom:
this.fillStart = .75;
}
}
};
return i;
}(cc.Sprite);
t.Image = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
return function() {
this.addDelay = 0;
this.rect = new cc.Rect();
};
}();
t.Frame = e;
var i = function(t) {
__extends(e, t);
function e() {
var e = t.call(this) || this;
e.interval = 0;
e.repeatDelay = 0;
e.timeScale = 1;
e._playing = !0;
e._frameCount = 0;
e._frame = 0;
e._start = 0;
e._end = 0;
e._times = 0;
e._endAt = 0;
e._status = 0;
e._smoothing = !0;
e._frameElapsed = 0;
e._reversed = !1;
e._repeatedCount = 0;
e.setPlaySettings();
return e;
}
Object.defineProperty(e.prototype, "frames", {
get: function() {
return this._frames;
},
set: function(t) {
this._frames = t;
if (null != this._frames) {
this._frameCount = this._frames.length;
(-1 == this._end || this._end > this._frameCount - 1) && (this._end = this._frameCount - 1);
(-1 == this._endAt || this._endAt > this._frameCount - 1) && (this._endAt = this._frameCount - 1);
(this._frame < 0 || this._frame > this._frameCount - 1) && (this._frame = this._frameCount - 1);
this.type = cc.Sprite.Type.SIMPLE;
this.drawFrame();
this._frameElapsed = 0;
this._repeatedCount = 0;
this._reversed = !1;
} else this._frameCount = 0;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "frameCount", {
get: function() {
return this._frameCount;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "frame", {
get: function() {
return this._frame;
},
set: function(t) {
if (this._frame != t) {
null != this._frames && t >= this._frameCount && (t = this._frameCount - 1);
this._frame = t;
this._frameElapsed = 0;
this.drawFrame();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "playing", {
get: function() {
return this._playing;
},
set: function(t) {
this._playing != t && (this._playing = t);
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "smoothing", {
get: function() {
return this._smoothing;
},
set: function(t) {
this._smoothing = t;
},
enumerable: !0,
configurable: !0
});
e.prototype.rewind = function() {
this._frame = 0;
this._frameElapsed = 0;
this._reversed = !1;
this._repeatedCount = 0;
this.drawFrame();
};
e.prototype.syncStatus = function(t) {
this._frame = t._frame;
this._frameElapsed = t._frameElapsed;
this._reversed = t._reversed;
this._repeatedCount = t._repeatedCount;
this.drawFrame();
};
e.prototype.advance = function(t) {
for (var e = this._frame, i = this._reversed, n = t; ;) {
var o = this.interval + this._frames[this._frame].addDelay;
0 == this._frame && this._repeatedCount > 0 && (o += this.repeatDelay);
if (t < o) {
this._frameElapsed = 0;
break;
}
t -= o;
if (this.swing) if (this._reversed) {
this._frame--;
if (this._frame <= 0) {
this._frame = 0;
this._repeatedCount++;
this._reversed = !this._reversed;
}
} else {
this._frame++;
if (this._frame > this._frameCount - 1) {
this._frame = Math.max(0, this._frameCount - 2);
this._repeatedCount++;
this._reversed = !this._reversed;
}
} else {
this._frame++;
if (this._frame > this._frameCount - 1) {
this._frame = 0;
this._repeatedCount++;
}
}
if (this._frame == e && this._reversed == i) {
var r = n - t;
t -= Math.floor(t / r) * r;
}
}
this.drawFrame();
};
e.prototype.setPlaySettings = function(t, e, i, n, o, r) {
void 0 == t && (t = 0);
void 0 == e && (e = -1);
void 0 == i && (i = 0);
void 0 == n && (n = -1);
this._start = t;
this._end = e;
(-1 == this._end || this._end > this._frameCount - 1) && (this._end = this._frameCount - 1);
this._times = i;
this._endAt = n;
-1 == this._endAt && (this._endAt = this._end);
this._status = 0;
this._callback = o;
this._callbackObj = r;
this.frame = t;
};
e.prototype.update = function(t) {
if (this._playing && 0 != this._frameCount && 3 != this._status) {
1 != this.timeScale && (t *= this.timeScale);
this._frameElapsed += t;
var e = this.interval + this._frames[this._frame].addDelay;
0 == this._frame && this._repeatedCount > 0 && (e += this.repeatDelay);
if (!(this._frameElapsed < e)) {
this._frameElapsed -= e;
this._frameElapsed > this.interval && (this._frameElapsed = this.interval);
if (this.swing) if (this._reversed) {
this._frame--;
if (this._frame <= 0) {
this._frame = 0;
this._repeatedCount++;
this._reversed = !this._reversed;
}
} else {
this._frame++;
if (this._frame > this._frameCount - 1) {
this._frame = Math.max(0, this._frameCount - 2);
this._repeatedCount++;
this._reversed = !this._reversed;
}
} else {
this._frame++;
if (this._frame > this._frameCount - 1) {
this._frame = 0;
this._repeatedCount++;
}
}
if (1 == this._status) {
this._frame = this._start;
this._frameElapsed = 0;
this._status = 0;
} else if (2 == this._status) {
this._frame = this._endAt;
this._frameElapsed = 0;
this._status = 3;
if (null != this._callback) {
var i = this._callback, n = this._callbackObj;
this._callback = null;
this._callbackObj = null;
i.call(n);
}
} else if (this._frame == this._end) if (this._times > 0) {
this._times--;
0 == this._times ? this._status = 2 : this._status = 1;
} else 0 != this._start && (this._status = 1);
this.drawFrame();
}
}
};
e.prototype.drawFrame = function() {
if (this._frameCount > 0 && this._frame < this._frames.length) {
var t = this._frames[this._frame];
this.spriteFrame = t.texture;
}
};
return e;
}(t.Image);
t.MovieClip = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i(t, i) {
var n = e.call(this, t, i) || this;
n.pos = new cc.Vec2();
n.touchId = 0;
n.clickCount = 0;
n.button = 0;
n.keyModifiers = 0;
n.mouseWheelDelta = 0;
return n;
}
Object.defineProperty(i.prototype, "isShiftDown", {
get: function() {
return !1;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(i.prototype, "isCtrlDown", {
get: function() {
return !1;
},
enumerable: !0,
configurable: !0
});
i.prototype.captureTouch = function() {
var e = t.GObject.cast(this.currentTarget);
e && this._processor.addTouchMonitor(this.touchId, e);
};
i._borrow = function(t, e) {
var n;
if (i._eventPool.length) {
(n = i._eventPool.pop()).type = t;
n.bubbles = e;
} else n = new i(t, e);
return n;
};
i._return = function(t) {
t.initiator = null;
t.touch = null;
t.unuse();
i._eventPool.push(t);
};
i.TOUCH_BEGIN = "fui_touch_begin";
i.TOUCH_MOVE = "fui_touch_move";
i.TOUCH_END = "fui_touch_end";
i.CLICK = "fui_click";
i.ROLL_OVER = "fui_roll_over";
i.ROLL_OUT = "fui_roll_out";
i.MOUSE_WHEEL = "fui_mouse_wheel";
i.DISPLAY = "fui_display";
i.UNDISPLAY = "fui_undisplay";
i.GEAR_STOP = "fui_gear_stop";
i.LINK = "fui_text_link";
i.Submit = "editing-return";
i.TEXT_CHANGE = "text-changed";
i.STATUS_CHANGED = "fui_status_changed";
i.XY_CHANGED = "fui_xy_changed";
i.SIZE_CHANGED = "fui_size_changed";
i.SIZE_DELAY_CHANGE = "fui_size_delay_change";
i.DRAG_START = "fui_drag_start";
i.DRAG_MOVE = "fui_drag_move";
i.DRAG_END = "fui_drag_end";
i.DROP = "fui_drop";
i.SCROLL = "fui_scroll";
i.SCROLL_END = "fui_scroll_end";
i.PULL_DOWN_RELEASE = "fui_pull_down_release";
i.PULL_UP_RELEASE = "fui_pull_up_release";
i.CLICK_ITEM = "fui_click_item";
i._eventPool = new Array();
return i;
}(cc.Event);
t.Event = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t(t, e, i) {
this._data = t;
this.offsetX = void 0 == e ? 0 : e;
this.offsetY = void 0 == i ? 0 : i;
this.scaleX = 1;
this.scaleY = 1;
}
t.prototype.hitTest = function(t, e, i) {
e = Math.floor((e / this.scaleX - this.offsetX) * this._data.scale);
i = Math.floor((i / this.scaleY - this.offsetY) * this._data.scale);
if (e < 0 || i < 0 || e >= this._data.pixelWidth) return !1;
var n = i * this._data.pixelWidth + e, o = Math.floor(n / 8), r = n % 8;
return o >= 0 && o < this._data.pixels.length && 1 == (this._data.pixels[o] >> r & 1);
};
return t;
}();
t.PixelHitTest = e;
var i = function() {
return function(t) {
t.readInt();
this.pixelWidth = t.readInt();
this.scale = 1 / t.readByte();
this.pixels = t.readBuffer().data;
};
}();
t.PixelHitTestData = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(n, e);
function n() {
var t = e.call(this) || this;
t._touches = new Array();
t._rollOutChain = new Array();
t._rollOverChain = new Array();
t._touchPos = new cc.Vec2();
return t;
}
n.prototype.onLoad = function() {
this._owner = this.node.$gobj;
};
n.prototype.onEnable = function() {
var t = this.node;
t.on(cc.Node.EventType.TOUCH_START, this.touchBeginHandler, this);
t.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
t.on(cc.Node.EventType.TOUCH_END, this.touchEndHandler, this);
t.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
t.on(cc.Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
t.on(cc.Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
t.on(cc.Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
t.on(cc.Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
this._touchListener = this.node._touchListener;
};
n.prototype.onDisable = function() {
var t = this.node;
t.off(cc.Node.EventType.TOUCH_START, this.touchBeginHandler, this);
t.off(cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
t.off(cc.Node.EventType.TOUCH_END, this.touchEndHandler, this);
t.off(cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
t.off(cc.Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
t.off(cc.Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
t.off(cc.Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
t.off(cc.Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
this._touchListener = null;
};
n.prototype.getAllTouches = function(t) {
t = t || new Array();
for (var e = this._touches.length, i = 0; i < e; i++) {
var n = this._touches[i];
-1 != n.touchId && t.push(n.touchId);
}
return t;
};
n.prototype.getTouchPosition = function(t) {
void 0 === t && (t = -1);
for (var e = this._touches.length, i = 0; i < e; i++) {
var n = this._touches[i];
if (-1 != n.touchId && (-1 == t || n.touchId == t)) return n.pos;
}
return cc.Vec2.ZERO;
};
n.prototype.getTouchTarget = function() {
for (var t = this._touches.length, e = 0; e < t; e++) {
var i = this._touches[e];
if (-1 != i.touchId) return i.target;
}
return null;
};
n.prototype.addTouchMonitor = function(t, e) {
var i = this.getInfo(t, !1);
if (i) {
-1 == i.touchMonitors.indexOf(e) && i.touchMonitors.push(e);
}
};
n.prototype.removeTouchMonitor = function(t) {
for (var e = this._touches.length, i = 0; i < e; i++) {
var n = this._touches[i], o = n.touchMonitors.indexOf(t);
-1 != o && n.touchMonitors.splice(o, 1);
}
};
n.prototype.cancelClick = function(t) {
var e = this.getInfo(t, !1);
e && (e.clickCancelled = !0);
};
n.prototype.simulateClick = function(e) {
var i;
(i = t.Event._borrow(t.Event.TOUCH_BEGIN, !0)).initiator = e;
i.pos.set(e.localToGlobal());
i.touchId = 0;
i.clickCount = 1;
i.button = 0;
i._processor = this;
this._captureCallback && this._captureCallback.call(this._owner, i);
e.node.dispatchEvent(i);
i.unuse();
i.type = t.Event.TOUCH_END;
i.bubbles = !0;
e.node.dispatchEvent(i);
i.unuse();
i.type = t.Event.CLICK;
i.bubbles = !0;
e.node.dispatchEvent(i);
t.Event._return(i);
};
n.prototype.touchBeginHandler = function(e, i) {
var n = this.updateInfo(e.getID(), e.getLocation(), e);
this._touchListener.setSwallowTouches(n.target != this._owner);
this.setBegin(n);
var o = this.getEvent(n, n.target, t.Event.TOUCH_BEGIN, !0);
this._captureCallback && this._captureCallback.call(this._owner, o);
n.target.node.dispatchEvent(o);
this.handleRollOver(n, n.target);
return !0;
};
n.prototype.touchMoveHandler = function(e, i) {
var n = this.updateInfo(e.getID(), e.getLocation(), e);
this.handleRollOver(n, n.target);
if (n.began) {
for (var o = this.getEvent(n, n.target, t.Event.TOUCH_MOVE, !1), r = !1, s = n.touchMonitors.length, a = 0; a < s; a++) {
var h = n.touchMonitors[a];
if (null != h.node && h.node.activeInHierarchy) {
o.unuse();
o.type = t.Event.TOUCH_MOVE;
h.node.dispatchEvent(o);
h == this._owner && (r = !0);
}
}
if (!r && null != this.node) {
o.unuse();
o.type = t.Event.TOUCH_MOVE;
this.node.dispatchEvent(o);
}
t.Event._return(o);
}
};
n.prototype.touchEndHandler = function(e, i) {
var n = this.updateInfo(e.getID(), e.getLocation(), e);
this.setEnd(n);
for (var o = this.getEvent(n, n.target, t.Event.TOUCH_END, !1), r = n.touchMonitors.length, s = 0; s < r; s++) {
var a = n.touchMonitors[s];
if (a != n.target && null != a.node && a.node.activeInHierarchy && !(a instanceof t.GComponent && a.isAncestorOf(n.target))) {
o.unuse();
o.type = t.Event.TOUCH_END;
a.node.dispatchEvent(o);
}
}
n.touchMonitors.length = 0;
if (n.target && null != n.target.node) {
n.target instanceof t.GRichTextField && n.target.node.getComponent(cc.RichText)._onTouchEnded(o);
o.unuse();
o.type = t.Event.TOUCH_END;
o.bubbles = !0;
n.target.node.dispatchEvent(o);
}
t.Event._return(o);
n.target = this.clickTest(n);
if (n.target) {
o = this.getEvent(n, n.target, t.Event.CLICK, !0);
n.target.node.dispatchEvent(o);
t.Event._return(o);
}
cc.sys.isMobile ? this.handleRollOver(n, null) : this.handleRollOver(n, n.target);
n.target = null;
n.touchId = -1;
n.button = -1;
};
n.prototype.touchCancelHandler = function(e, i) {
for (var n = this.updateInfo(e.getID(), e.getLocation(), e), o = this.getEvent(n, n.target, t.Event.TOUCH_END, !1), r = n.touchMonitors.length, s = 0; s < r; s++) {
var a = n.touchMonitors[s];
if (a != n.target && null != a.node && a.node.activeInHierarchy && !(a instanceof t.GComponent && a.isAncestorOf(n.target))) {
o.initiator = a;
a.node.dispatchEvent(o);
}
}
n.touchMonitors.length = 0;
if (n.target && null != n.target.node) {
o.bubbles = !0;
n.target.node.dispatchEvent(o);
}
t.Event._return(o);
this.handleRollOver(n, null);
n.target = null;
n.touchId = -1;
n.button = -1;
};
n.prototype.mouseDownHandler = function(t) {
this.getInfo(0, !0).button = t.getButton();
};
n.prototype.mouseUpHandler = function(t) {
this.getInfo(0, !0).button = t.getButton();
};
n.prototype.mouseMoveHandler = function(e) {
var i = this.getInfo(0, !1);
if (!(i && Math.abs(i.pos.x - e.getLocationX()) < 1 && Math.abs(i.pos.y - (t.GRoot.inst.height - e.getLocationY())) < 1)) {
i = this.updateInfo(0, e.getLocation());
this.handleRollOver(i, i.target);
if (i.began) {
for (var n = this.getEvent(i, i.target, t.Event.TOUCH_MOVE, !1), o = !1, r = i.touchMonitors.length, s = 0; s < r; s++) {
var a = i.touchMonitors[s];
if (null != a.node && a.node.activeInHierarchy) {
n.initiator = a;
a.node.dispatchEvent(n);
a == this._owner && (o = !0);
}
}
if (!o && null != this.node) {
n.initiator = this._owner;
this.node.dispatchEvent(n);
t.Event._return(n);
}
t.Event._return(n);
}
}
};
n.prototype.mouseWheelHandler = function(e) {
var i = this.updateInfo(0, e.getLocation());
i.mouseWheelDelta = Math.max(e.getScrollX(), e.getScrollY());
var n = this.getEvent(i, i.target, t.Event.MOUSE_WHEEL, !0);
i.target.node.dispatchEvent(n);
t.Event._return(n);
};
n.prototype.updateInfo = function(e, i, n) {
var o = cc.Camera.findCamera(this.node);
o ? o.getCameraToWorldPoint(i, this._touchPos) : this._touchPos.set(i);
var r = this._owner.hitTest(this._touchPos);
r || (r = this._owner);
var s = this.getInfo(e);
s.target = r;
s.pos.x = i.x;
s.pos.y = t.GRoot.inst.height - i.y;
s.button = cc.Event.EventMouse.BUTTON_LEFT;
s.touch = n;
return s;
};
n.prototype.getInfo = function(t, e) {
void 0 === e && (e = !0);
for (var n = null, o = this._touches.length, r = 0; r < o; r++) {
var s = this._touches[r];
if (s.touchId == t) return s;
-1 == s.touchId && (n = s);
}
if (!n) {
if (!e) return null;
n = new i();
this._touches.push(n);
}
n.touchId = t;
return n;
};
n.prototype.setBegin = function(t) {
t.began = !0;
t.clickCancelled = !1;
t.downPos.set(t.pos);
t.downTargets.length = 0;
for (var e = t.target; null != e; ) {
t.downTargets.push(e);
e = e.findParent();
}
};
n.prototype.setEnd = function(e) {
e.began = !1;
var i = t.ToolSet.getTime();
i - e.lastClickTime < .45 ? 2 == e.clickCount ? e.clickCount = 1 : e.clickCount++ : e.clickCount = 1;
e.lastClickTime = i;
};
n.prototype.clickTest = function(t) {
if (0 == t.downTargets.length || t.clickCancelled || Math.abs(t.pos.x - t.downPos.x) > 50 || Math.abs(t.pos.y - t.downPos.y) > 50) return null;
var e = t.downTargets[0];
if (e && null != e.node && e.node.activeInHierarchy) return e;
e = t.target;
for (;null != e; ) {
if (-1 != t.downTargets.indexOf(e) && null != e.node && e.node.activeInHierarchy) break;
e = e.findParent();
}
return e;
};
n.prototype.handleRollOver = function(e, i) {
if (e.lastRollOver != i) {
for (var n = e.lastRollOver; null != n && null != n.node; ) {
this._rollOutChain.push(n);
n = n.findParent();
}
n = i;
for (;null != n && null != n.node; ) {
if (-1 != (r = this._rollOutChain.indexOf(n))) {
this._rollOutChain.length = r;
break;
}
this._rollOverChain.push(n);
n = n.findParent();
}
e.lastRollOver = i;
for (var o = this._rollOutChain.length, r = 0; r < o; r++) if (null != (n = this._rollOutChain[r]).node && n.node.activeInHierarchy) {
var s = this.getEvent(e, n, t.Event.ROLL_OUT, !1);
n.node.dispatchEvent(s);
t.Event._return(s);
}
o = this._rollOverChain.length;
for (r = 0; r < o; r++) if (null != (n = this._rollOverChain[r]).node && n.node.activeInHierarchy) {
s = this.getEvent(e, n, t.Event.ROLL_OVER, !1);
n.node.dispatchEvent(s);
t.Event._return(s);
}
this._rollOutChain.length = 0;
this._rollOverChain.length = 0;
}
};
n.prototype.getEvent = function(e, i, n, o) {
var r = t.Event._borrow(n, o);
r.initiator = i;
r.touch = e.touch;
r.pos.set(e.pos);
r.touchId = e.touch ? e.touch.getID() : 0;
r.clickCount = e.clickCount;
r.button = e.button;
r.mouseWheelDelta = e.mouseWheelDelta;
r._processor = this;
return r;
};
return n;
}(cc.Component);
t.InputProcessor = e;
var i = function() {
return function() {
this.pos = new cc.Vec2();
this.touchId = 0;
this.clickCount = 0;
this.mouseWheelDelta = 0;
this.button = -1;
this.downPos = new cc.Vec2();
this.began = !1;
this.clickCancelled = !1;
this.lastClickTime = 0;
this.downTargets = new Array();
this.touchMonitors = new Array();
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(t) {
this._owner = t;
}
Object.defineProperty(e.prototype, "controller", {
get: function() {
return this._controller;
},
set: function(t) {
if (t != this._controller) {
this._controller = t;
this._controller && this.init();
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "tweenConfig", {
get: function() {
null == this._tweenConfig && (this._tweenConfig = new i());
return this._tweenConfig;
},
enumerable: !0,
configurable: !0
});
e.prototype.setup = function(e) {
this._controller = this._owner.parent.getControllerAt(e.readShort());
this.init();
var n, o, r;
if (this instanceof t.GearDisplay) {
n = e.readShort();
var s = [];
for (o = 0; o < n; o++) s[o] = e.readS();
this.pages = s;
} else {
n = e.readShort();
for (o = 0; o < n; o++) null != (r = e.readS()) && this.addStatus(r, e);
e.readBool() && this.addStatus(null, e);
}
if (e.readBool()) {
this._tweenConfig = new i();
this._tweenConfig.easeType = e.readByte();
this._tweenConfig.duration = e.readFloat();
this._tweenConfig.delay = e.readFloat();
}
};
e.prototype.updateFromRelations = function(t, e) {};
e.prototype.addStatus = function(t, e) {};
e.prototype.init = function() {};
e.prototype.apply = function() {};
e.prototype.updateState = function() {};
e.disableAllTweenEffect = !1;
return e;
}();
t.GearBase = e;
var i = function() {
return function() {
this.tween = !0;
this.easeType = t.EaseType.QuadOut;
this.duration = .3;
this.delay = 0;
};
}();
t.GearTweenConfig = i;
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e(e) {
return t.call(this, e) || this;
}
e.prototype.init = function() {
this._default = new i(this._owner.playing, this._owner.frame);
this._storage = {};
};
e.prototype.addStatus = function(t, e) {
var n;
if (null == t) n = this._default; else {
n = new i();
this._storage[t] = n;
}
n.playing = e.readBool();
n.frame = e.readInt();
};
e.prototype.apply = function() {
this._owner._gearLocked = !0;
var t = this._storage[this._controller.selectedPageId];
t || (t = this._default);
this._owner.frame = t.frame;
this._owner.playing = t.playing;
this._owner._gearLocked = !1;
};
e.prototype.updateState = function() {
var t = this._storage[this._controller.selectedPageId];
if (!t) {
t = new i();
this._storage[this._controller.selectedPageId] = t;
}
t.frame = this._owner.frame;
t.playing = this._owner.playing;
};
return e;
}(t.GearBase);
t.GearAnimation = e;
var i = function() {
return function(t, e) {
void 0 === t && (t = !0);
void 0 === e && (e = 0);
this.playing = t;
this.frame = e;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e(e) {
return t.call(this, e) || this;
}
e.prototype.init = function() {
void 0 != this._owner.strokeColor ? this._default = new i(this._owner.color, this._owner.strokeColor) : this._default = new i(this._owner.color);
this._storage = {};
};
e.prototype.addStatus = function(t, e) {
var n;
if (null == t) n = this._default; else {
n = new i();
this._storage[t] = n;
}
n.color = e.readColor();
n.strokeColor = e.readColor();
};
e.prototype.apply = function() {
this._owner._gearLocked = !0;
var t = this._storage[this._controller.selectedPageId];
t || (t = this._default);
this._owner.color = t.color;
void 0 != this._owner.strokeColor && 0 != t.strokeColor.getA() && (this._owner.strokeColor = t.strokeColor);
this._owner._gearLocked = !1;
};
e.prototype.updateState = function() {
var t = this._storage[this._controller.selectedPageId];
if (!t) {
t = new i(null, null);
this._storage[this._controller.selectedPageId] = t;
}
t.color = this._owner.color;
void 0 != this._owner.strokeColor && (t.strokeColor = this._owner.strokeColor);
};
return e;
}(t.GearBase);
t.GearColor = e;
var i = function() {
return function(t, e) {
void 0 === t && (t = cc.Color.TRANSPARENT);
void 0 === e && (e = cc.Color.TRANSPARENT);
this.color = t;
this.strokeColor = e;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e(e) {
var i = t.call(this, e) || this;
i._displayLockToken = 1;
i._visible = 0;
return i;
}
e.prototype.init = function() {
this.pages = null;
};
e.prototype.apply = function() {
this._displayLockToken++;
0 == this._displayLockToken && (this._displayLockToken = 1);
null == this.pages || 0 == this.pages.length || -1 != this.pages.indexOf(this._controller.selectedPageId) ? this._visible = 1 : this._visible = 0;
};
e.prototype.addLock = function() {
this._visible++;
return this._displayLockToken;
};
e.prototype.releaseLock = function(t) {
t == this._displayLockToken && this._visible--;
};
Object.defineProperty(e.prototype, "connected", {
get: function() {
return null == this._controller || this._visible > 0;
},
enumerable: !0,
configurable: !0
});
return e;
}(t.GearBase);
t.GearDisplay = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e(e) {
return t.call(this, e) || this;
}
e.prototype.init = function() {
this._default = this._owner.icon;
this._storage = {};
};
e.prototype.addStatus = function(t, e) {
null == t ? this._default = e.readS() : this._storage[t] = e.readS();
};
e.prototype.apply = function() {
this._owner._gearLocked = !0;
var t = this._storage[this._controller.selectedPageId];
this._owner.icon = void 0 !== t ? t : this._default;
this._owner._gearLocked = !1;
};
e.prototype.updateState = function() {
this._storage[this._controller.selectedPageId] = this._owner.icon;
};
return e;
}(t.GearBase);
t.GearIcon = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(n, e);
function n(t) {
return e.call(this, t) || this;
}
n.prototype.init = function() {
this._default = new i(this._owner.alpha, this._owner.rotation, this._owner.grayed, this._owner.touchable);
this._storage = {};
};
n.prototype.addStatus = function(t, e) {
var n;
if (null == t) n = this._default; else {
n = new i();
this._storage[t] = n;
}
n.alpha = e.readFloat();
n.rotation = e.readFloat();
n.grayed = e.readBool();
n.touchable = e.readBool();
};
n.prototype.apply = function() {
var e = this._storage[this._controller.selectedPageId];
e || (e = this._default);
if (this._tweenConfig && this._tweenConfig.tween && !t.UIPackage._constructing && !t.GearBase.disableAllTweenEffect) {
this._owner._gearLocked = !0;
this._owner.grayed = e.grayed;
this._owner.touchable = e.touchable;
this._owner._gearLocked = !1;
if (null != this._tweenConfig._tweener) {
if (this._tweenConfig._tweener.endValue.x == e.alpha && this._tweenConfig._tweener.endValue.y == e.rotation) return;
this._tweenConfig._tweener.kill(!0);
this._tweenConfig._tweener = null;
}
var i = e.alpha != this._owner.alpha, n = e.rotation != this._owner.rotation;
if (i || n) {
this._owner.checkGearController(0, this._controller) && (this._tweenConfig._displayLockToken = this._owner.addDisplayLock());
this._tweenConfig._tweener = t.GTween.to2(this._owner.alpha, this._owner.rotation, e.alpha, e.rotation, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((i ? 1 : 0) + (n ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
}
} else {
this._owner._gearLocked = !0;
this._owner.grayed = e.grayed;
this._owner.touchable = e.touchable;
this._owner.alpha = e.alpha;
this._owner.rotation = e.rotation;
this._owner._gearLocked = !1;
}
};
n.prototype.__tweenUpdate = function(t) {
var e = t.userData;
this._owner._gearLocked = !0;
0 != (1 & e) && (this._owner.alpha = t.value.x);
0 != (2 & e) && (this._owner.rotation = t.value.y);
this._owner._gearLocked = !1;
};
n.prototype.__tweenComplete = function() {
if (0 != this._tweenConfig._displayLockToken) {
this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
this._tweenConfig._displayLockToken = 0;
}
this._tweenConfig._tweener = null;
};
n.prototype.updateState = function() {
var t = this._storage[this._controller.selectedPageId];
if (!t) {
t = new i();
this._storage[this._controller.selectedPageId] = t;
}
t.alpha = this._owner.alpha;
t.rotation = this._owner.rotation;
t.grayed = this._owner.grayed;
t.touchable = this._owner.touchable;
};
return n;
}(t.GearBase);
t.GearLook = e;
var i = function() {
return function(t, e, i, n) {
void 0 === t && (t = 0);
void 0 === e && (e = 0);
void 0 === i && (i = !1);
void 0 === n && (n = !0);
this.alpha = t;
this.rotation = e;
this.grayed = i;
this.touchable = n;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(n, e);
function n(t) {
return e.call(this, t) || this;
}
n.prototype.init = function() {
this._default = new i(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY);
this._storage = {};
};
n.prototype.addStatus = function(t, e) {
var n;
if (null == t) n = this._default; else {
n = new i();
this._storage[t] = n;
}
n.width = e.readInt();
n.height = e.readInt();
n.scaleX = e.readFloat();
n.scaleY = e.readFloat();
};
n.prototype.apply = function() {
var e = this._storage[this._controller.selectedPageId];
e || (e = this._default);
if (this._tweenConfig && this._tweenConfig.tween && !t.UIPackage._constructing && !t.GearBase.disableAllTweenEffect) {
if (null != this._tweenConfig._tweener) {
if (this._tweenConfig._tweener.endValue.x == e.width && this._tweenConfig._tweener.endValue.y == e.height && this._tweenConfig._tweener.endValue.z == e.scaleX && this._tweenConfig._tweener.endValue.w == e.scaleY) return;
this._tweenConfig._tweener.kill(!0);
this._tweenConfig._tweener = null;
}
var i = e.width != this._owner.width || e.height != this._owner.height, n = e.scaleX != this._owner.scaleX || e.scaleY != this._owner.scaleY;
if (i || n) {
this._owner.checkGearController(0, this._controller) && (this._tweenConfig._displayLockToken = this._owner.addDisplayLock());
this._tweenConfig._tweener = t.GTween.to4(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY, e.width, e.height, e.scaleX, e.scaleY, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((i ? 1 : 0) + (n ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
}
} else {
this._owner._gearLocked = !0;
this._owner.setSize(e.width, e.height, this._owner.gearXY.controller == this._controller);
this._owner.setScale(e.scaleX, e.scaleY);
this._owner._gearLocked = !1;
}
};
n.prototype.__tweenUpdate = function(t) {
var e = t.userData;
this._owner._gearLocked = !0;
0 != (1 & e) && this._owner.setSize(t.value.x, t.value.y, this._owner.checkGearController(1, this._controller));
0 != (2 & e) && this._owner.setScale(t.value.z, t.value.w);
this._owner._gearLocked = !1;
};
n.prototype.__tweenComplete = function() {
if (0 != this._tweenConfig._displayLockToken) {
this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
this._tweenConfig._displayLockToken = 0;
}
this._tweenConfig._tweener = null;
};
n.prototype.updateState = function() {
var t = this._storage[this._controller.selectedPageId];
if (!t) {
t = new i();
this._storage[this._controller.selectedPageId] = t;
}
t.width = this._owner.width;
t.height = this._owner.height;
t.scaleX = this._owner.scaleX;
t.scaleY = this._owner.scaleY;
};
n.prototype.updateFromRelations = function(t, e) {
if (null != this._controller && null != this._storage) {
for (var i in this._storage) {
var n = this._storage[i];
n.width += t;
n.height += e;
}
this._default.width += t;
this._default.height += e;
this.updateState();
}
};
return n;
}(t.GearBase);
t.GearSize = e;
var i = function() {
return function(t, e, i, n) {
void 0 === t && (t = 0);
void 0 === e && (e = 0);
void 0 === i && (i = 0);
void 0 === n && (n = 0);
this.width = t;
this.height = e;
this.scaleX = i;
this.scaleY = n;
};
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function(t) {
__extends(e, t);
function e(e) {
return t.call(this, e) || this;
}
e.prototype.init = function() {
this._default = this._owner.text;
this._storage = {};
};
e.prototype.addStatus = function(t, e) {
null == t ? this._default = e.readS() : this._storage[t] = e.readS();
};
e.prototype.apply = function() {
this._owner._gearLocked = !0;
var t = this._storage[this._controller.selectedPageId];
this._owner.text = void 0 !== t ? t : this._default;
this._owner._gearLocked = !1;
};
e.prototype.updateState = function() {
this._storage[this._controller.selectedPageId] = this._owner.text;
};
return e;
}(t.GearBase);
t.GearText = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function(e) {
__extends(i, e);
function i(t) {
return e.call(this, t) || this;
}
i.prototype.init = function() {
this._default = new cc.Vec2(this._owner.x, this._owner.y);
this._storage = {};
};
i.prototype.addStatus = function(t, e) {
var i;
if (null == t) i = this._default; else {
i = new cc.Vec2();
this._storage[t] = i;
}
i.x = e.readInt();
i.y = e.readInt();
};
i.prototype.apply = function() {
var e = this._storage[this._controller.selectedPageId];
e || (e = this._default);
if (this._tweenConfig && this._tweenConfig.tween && !t.UIPackage._constructing && !t.GearBase.disableAllTweenEffect) {
if (null != this._tweenConfig._tweener) {
if (this._tweenConfig._tweener.endValue.x == e.x && this._tweenConfig._tweener.endValue.y == e.y) return;
this._tweenConfig._tweener.kill(!0);
this._tweenConfig._tweener = null;
}
if (this._owner.x != e.x || this._owner.y != e.y) {
this._owner.checkGearController(0, this._controller) && (this._tweenConfig._displayLockToken = this._owner.addDisplayLock());
this._tweenConfig._tweener = t.GTween.to2(this._owner.x, this._owner.y, e.x, e.y, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
}
} else {
this._owner._gearLocked = !0;
this._owner.setPosition(e.x, e.y);
this._owner._gearLocked = !1;
}
};
i.prototype.__tweenUpdate = function(t) {
this._owner._gearLocked = !0;
this._owner.setPosition(t.value.x, t.value.y);
this._owner._gearLocked = !1;
};
i.prototype.__tweenComplete = function() {
if (0 != this._tweenConfig._displayLockToken) {
this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
this._tweenConfig._displayLockToken = 0;
}
this._tweenConfig._tweener = null;
};
i.prototype.updateState = function() {
var t = this._storage[this._controller.selectedPageId];
if (!t) {
t = new cc.Vec2();
this._storage[this._controller.selectedPageId] = t;
}
t.x = this._owner.x;
t.y = this._owner.y;
};
i.prototype.updateFromRelations = function(t, e) {
if (null != this._controller && null != this._storage) {
for (var i in this._storage) {
var n = this._storage[i];
n.x += t;
n.y += e;
}
this._default.x += t;
this._default.y += e;
this.updateState();
}
};
return i;
}(t.GearBase);
t.GearXY = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t(t) {
this._level = 0;
t && (this._children = new Array());
}
Object.defineProperty(t.prototype, "expanded", {
get: function() {
return this._expanded;
},
set: function(t) {
if (null != this._children && this._expanded != t) {
this._expanded = t;
null != this._tree && (this._expanded ? this._tree._afterExpanded(this) : this._tree._afterCollapsed(this));
}
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "isFolder", {
get: function() {
return null != this._children;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "parent", {
get: function() {
return this._parent;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "data", {
get: function() {
return this._data;
},
set: function(t) {
this._data = t;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "text", {
get: function() {
return null != this._cell ? this._cell.text : null;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "cell", {
get: function() {
return this._cell;
},
enumerable: !0,
configurable: !0
});
t.prototype._setCell = function(t) {
this._cell = t;
};
Object.defineProperty(t.prototype, "level", {
get: function() {
return this._level;
},
enumerable: !0,
configurable: !0
});
t.prototype._setLevel = function(t) {
this._level = t;
};
t.prototype.addChild = function(t) {
this.addChildAt(t, this._children.length);
return t;
};
t.prototype.addChildAt = function(t, e) {
if (!t) throw new Error("child is null");
var i = this._children.length;
if (e >= 0 && e <= i) {
if (t._parent == this) this.setChildIndex(t, e); else {
t._parent && t._parent.removeChild(t);
e == this._children.length ? this._children.push(t) : this._children.splice(e, 0, t);
t._parent = this;
t._level = this._level + 1;
t._setTree(this._tree);
null != this._cell && null != this._cell.parent && this._expanded && this._tree._afterInserted(t);
}
return t;
}
throw new Error("Invalid child index");
};
t.prototype.removeChild = function(t) {
var e = this._children.indexOf(t);
-1 != e && this.removeChildAt(e);
return t;
};
t.prototype.removeChildAt = function(t) {
if (t >= 0 && t < this.numChildren) {
var e = this._children[t];
this._children.splice(t, 1);
e._parent = null;
if (null != this._tree) {
e._setTree(null);
this._tree._afterRemoved(e);
}
return e;
}
throw new Error("Invalid child index");
};
t.prototype.removeChildren = function(t, e) {
void 0 === t && (t = 0);
void 0 === e && (e = -1);
(e < 0 || e >= this.numChildren) && (e = this.numChildren - 1);
for (var i = t; i <= e; ++i) this.removeChildAt(t);
};
t.prototype.getChildAt = function(t) {
if (t >= 0 && t < this.numChildren) return this._children[t];
throw new Error("Invalid child index");
};
t.prototype.getChildIndex = function(t) {
return this._children.indexOf(t);
};
t.prototype.getPrevSibling = function() {
if (null == this._parent) return null;
var t = this._parent._children.indexOf(this);
return t <= 0 ? null : this._parent._children[t - 1];
};
t.prototype.getNextSibling = function() {
if (null == this._parent) return null;
var t = this._parent._children.indexOf(this);
return t < 0 || t >= this._parent._children.length - 1 ? null : this._parent._children[t + 1];
};
t.prototype.setChildIndex = function(t, e) {
var i = this._children.indexOf(t);
if (-1 == i) throw new Error("Not a child of this container");
var n = this._children.length;
e < 0 ? e = 0 : e > n && (e = n);
if (i != e) {
this._children.splice(i, 1);
this._children.splice(e, 0, t);
null != this._cell && null != this._cell.parent && this._expanded && this._tree._afterMoved(t);
}
};
t.prototype.swapChildren = function(t, e) {
var i = this._children.indexOf(t), n = this._children.indexOf(e);
if (-1 == i || -1 == n) throw new Error("Not a child of this container");
this.swapChildrenAt(i, n);
};
t.prototype.swapChildrenAt = function(t, e) {
var i = this._children[t], n = this._children[e];
this.setChildIndex(i, e);
this.setChildIndex(n, t);
};
Object.defineProperty(t.prototype, "numChildren", {
get: function() {
return this._children.length;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "tree", {
get: function() {
return this._tree;
},
enumerable: !0,
configurable: !0
});
t.prototype._setTree = function(t) {
this._tree = t;
null != this._tree && this._tree.treeNodeWillExpand && this._expanded && this._tree.treeNodeWillExpand(this);
if (null != this._children) for (var e = this._children.length, i = 0; i < e; i++) {
var n = this._children[i];
n._level = this._level + 1;
n._setTree(t);
}
};
return t;
}();
t.TreeNode = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e(e) {
this._list = e;
this._list.removeChildrenToPool();
this._list.on(t.Event.CLICK_ITEM, this.onClickItem, this);
this._root = new t.TreeNode(!0);
this._root._setTree(this);
this._root._setCell(this._list);
this._root.expanded = !0;
this._indent = 15;
}
Object.defineProperty(e.prototype, "list", {
get: function() {
return this._list;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "root", {
get: function() {
return this._root;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "indent", {
get: function() {
return this._indent;
},
set: function(t) {
this._indent = t;
},
enumerable: !0,
configurable: !0
});
e.prototype.getSelectedNode = function() {
return -1 != this._list.selectedIndex ? this._list.getChildAt(this._list.selectedIndex).data : null;
};
e.prototype.getSelection = function() {
for (var t = this._list.getSelection(), e = t.length, i = new Array(), n = 0; n < e; n++) {
var o = this._list.getChildAt(t[n]).data;
i.push(o);
}
return i;
};
e.prototype.addSelection = function(t, e) {
for (var i = t.parent; null != i && i != this._root; ) {
i.expanded = !0;
i = i.parent;
}
t.cell && this._list.addSelection(this._list.getChildIndex(t.cell), e);
};
e.prototype.removeSelection = function(t) {
t.cell && this._list.removeSelection(this._list.getChildIndex(t.cell));
};
e.prototype.clearSelection = function() {
this._list.clearSelection();
};
e.prototype.getNodeIndex = function(t) {
return this._list.getChildIndex(t.cell);
};
e.prototype.updateNode = function(t) {
null != t.cell && this.treeNodeRender && this.treeNodeRender(t);
};
e.prototype.updateNodes = function(t) {
for (var e = t.length, i = 0; i < e; i++) {
var n = t[i];
if (null == n.cell) return;
this.treeNodeRender && this.treeNodeRender(n);
}
};
e.prototype.expandAll = function(t) {
t.expanded = !0;
for (var e = t.numChildren, i = 0; i < e; i++) {
var n = t.getChildAt(i);
n.isFolder && this.expandAll(n);
}
};
e.prototype.collapseAll = function(t) {
t != this._root && (t.expanded = !1);
for (var e = t.numChildren, i = 0; i < e; i++) {
var n = t.getChildAt(i);
n.isFolder && this.collapseAll(n);
}
};
e.prototype.createCell = function(t) {
this.treeNodeCreateCell ? t._setCell(this.treeNodeCreateCell(t)) : t._setCell(this._list.itemPool.getObject(this._list.defaultItem));
t.cell.data = t;
var e = t.cell.getChild("indent");
null != e && (e.width = (t.level - 1) * this._indent);
var i = t.cell.getChild("expandButton");
if (i) if (t.isFolder) {
i.visible = !0;
i.onClick(this.onClickExpandButton, this);
i.data = t;
i.selected = t.expanded;
} else i.visible = !1;
this.treeNodeRender && this.treeNodeRender(t);
};
e.prototype._afterInserted = function(t) {
this.createCell(t);
var e = this.getInsertIndexForNode(t);
this._list.addChildAt(t.cell, e);
this.treeNodeRender && this.treeNodeRender(t);
t.isFolder && t.expanded && this.checkChildren(t, e);
};
e.prototype.getInsertIndexForNode = function(t) {
var e = t.getPrevSibling();
null == e && (e = t.parent);
for (var i = this._list.getChildIndex(e.cell) + 1, n = t.level, o = this._list.numChildren, r = i; r < o; r++) {
if (this._list.getChildAt(r).data.level <= n) break;
i++;
}
return i;
};
e.prototype._afterRemoved = function(t) {
this.removeNode(t);
};
e.prototype._afterExpanded = function(t) {
t != this._root && this.treeNodeWillExpand && this.treeNodeWillExpand(t);
if (null != t.cell) {
if (t != this._root) {
this.treeNodeRender && this.treeNodeRender(t);
var e = t.cell.getChild("expandButton");
e && (e.selected = !0);
}
null != t.cell.parent && this.checkChildren(t, this._list.getChildIndex(t.cell));
}
};
e.prototype._afterCollapsed = function(t) {
t != this._root && this.treeNodeWillExpand && this.treeNodeWillExpand(t);
if (null != t.cell) {
if (t != this._root) {
this.treeNodeRender && this.treeNodeRender(t);
var e = t.cell.getChild("expandButton");
e && (e.selected = !1);
}
null != t.cell.parent && this.hideFolderNode(t);
}
};
e.prototype._afterMoved = function(t) {
t.isFolder ? this.hideFolderNode(t) : this._list.removeChild(t.cell);
var e = this.getInsertIndexForNode(t);
this._list.addChildAt(t.cell, e);
t.isFolder && t.expanded && this.checkChildren(t, e);
};
e.prototype.checkChildren = function(t, e) {
for (var i = t.numChildren, n = 0; n < i; n++) {
e++;
var o = t.getChildAt(n);
null == o.cell && this.createCell(o);
o.cell.parent || this._list.addChildAt(o.cell, e);
o.isFolder && o.expanded && (e = this.checkChildren(o, e));
}
return e;
};
e.prototype.hideFolderNode = function(t) {
for (var e = t.numChildren, i = 0; i < e; i++) {
var n = t.getChildAt(i);
n.cell && null != n.cell.parent && this._list.removeChild(n.cell);
n.isFolder && n.expanded && this.hideFolderNode(n);
}
};
e.prototype.removeNode = function(t) {
if (null != t.cell) {
null != t.cell.parent && this._list.removeChild(t.cell);
this._list.returnToPool(t.cell);
t.cell.data = null;
t._setCell(null);
}
if (t.isFolder) for (var e = t.numChildren, i = 0; i < e; i++) {
var n = t.getChildAt(i);
this.removeNode(n);
}
};
e.prototype.onClickExpandButton = function(e) {
e.stopPropagation();
var i = t.GObject.cast(e.currentTarget), n = i.parent.data;
if (null != this._list.scrollPane) {
var o = this._list.scrollPane.posY;
i.selected ? n.expanded = !0 : n.expanded = !1;
this._list.scrollPane.posY = o;
this._list.scrollPane.scrollToView(n.cell);
} else i.selected ? n.expanded = !0 : n.expanded = !1;
};
e.prototype.onClickItem = function(t, e) {
var i;
null != this._list.scrollPane && (i = this._list.scrollPane.posY);
var n = t.data;
this.treeNodeClick && this.treeNodeClick(n, e);
if (null != this._list.scrollPane) {
this._list.scrollPane.posY = i;
n.cell && this._list.scrollPane.scrollToView(n.cell);
}
};
return e;
}();
t.TreeView = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.evaluate = function(n, o, r, s, a) {
switch (n) {
case t.EaseType.Linear:
return o / r;

case t.EaseType.SineIn:
return 1 - Math.cos(o / r * e._PiOver2);

case t.EaseType.SineOut:
return Math.sin(o / r * e._PiOver2);

case t.EaseType.SineInOut:
return -.5 * (Math.cos(Math.PI * o / r) - 1);

case t.EaseType.QuadIn:
return (o /= r) * o;

case t.EaseType.QuadOut:
return -(o /= r) * (o - 2);

case t.EaseType.QuadInOut:
return (o /= .5 * r) < 1 ? .5 * o * o : -.5 * (--o * (o - 2) - 1);

case t.EaseType.CubicIn:
return (o /= r) * o * o;

case t.EaseType.CubicOut:
return (o = o / r - 1) * o * o + 1;

case t.EaseType.CubicInOut:
return (o /= .5 * r) < 1 ? .5 * o * o * o : .5 * ((o -= 2) * o * o + 2);

case t.EaseType.QuartIn:
return (o /= r) * o * o * o;

case t.EaseType.QuartOut:
return -((o = o / r - 1) * o * o * o - 1);

case t.EaseType.QuartInOut:
return (o /= .5 * r) < 1 ? .5 * o * o * o * o : -.5 * ((o -= 2) * o * o * o - 2);

case t.EaseType.QuintIn:
return (o /= r) * o * o * o * o;

case t.EaseType.QuintOut:
return (o = o / r - 1) * o * o * o * o + 1;

case t.EaseType.QuintInOut:
return (o /= .5 * r) < 1 ? .5 * o * o * o * o * o : .5 * ((o -= 2) * o * o * o * o + 2);

case t.EaseType.ExpoIn:
return 0 == o ? 0 : Math.pow(2, 10 * (o / r - 1));

case t.EaseType.ExpoOut:
return o == r ? 1 : 1 - Math.pow(2, -10 * o / r);

case t.EaseType.ExpoInOut:
return 0 == o ? 0 : o == r ? 1 : (o /= .5 * r) < 1 ? .5 * Math.pow(2, 10 * (o - 1)) : .5 * (2 - Math.pow(2, -10 * --o));

case t.EaseType.CircIn:
return -(Math.sqrt(1 - (o /= r) * o) - 1);

case t.EaseType.CircOut:
return Math.sqrt(1 - (o = o / r - 1) * o);

case t.EaseType.CircInOut:
return (o /= .5 * r) < 1 ? -.5 * (Math.sqrt(1 - o * o) - 1) : .5 * (Math.sqrt(1 - (o -= 2) * o) + 1);

case t.EaseType.ElasticIn:
var h;
if (0 == o) return 0;
if (1 == (o /= r)) return 1;
0 == a && (a = .3 * r);
if (s < 1) {
s = 1;
h = a / 4;
} else h = a / e._TwoPi * Math.asin(1 / s);
return -s * Math.pow(2, 10 * (o -= 1)) * Math.sin((o * r - h) * e._TwoPi / a);

case t.EaseType.ElasticOut:
var l;
if (0 == o) return 0;
if (1 == (o /= r)) return 1;
0 == a && (a = .3 * r);
if (s < 1) {
s = 1;
l = a / 4;
} else l = a / e._TwoPi * Math.asin(1 / s);
return s * Math.pow(2, -10 * o) * Math.sin((o * r - l) * e._TwoPi / a) + 1;

case t.EaseType.ElasticInOut:
var c;
if (0 == o) return 0;
if (2 == (o /= .5 * r)) return 1;
0 == a && (a = r * (.3 * 1.5));
if (s < 1) {
s = 1;
c = a / 4;
} else c = a / e._TwoPi * Math.asin(1 / s);
return o < 1 ? s * Math.pow(2, 10 * (o -= 1)) * Math.sin((o * r - c) * e._TwoPi / a) * -.5 : s * Math.pow(2, -10 * (o -= 1)) * Math.sin((o * r - c) * e._TwoPi / a) * .5 + 1;

case t.EaseType.BackIn:
return (o /= r) * o * ((s + 1) * o - s);

case t.EaseType.BackOut:
return (o = o / r - 1) * o * ((s + 1) * o + s) + 1;

case t.EaseType.BackInOut:
return (o /= .5 * r) < 1 ? o * o * ((1 + (s *= 1.525)) * o - s) * .5 : .5 * ((o -= 2) * o * ((1 + (s *= 1.525)) * o + s) + 2);

case t.EaseType.BounceIn:
return i.easeIn(o, r);

case t.EaseType.BounceOut:
return i.easeOut(o, r);

case t.EaseType.BounceInOut:
return i.easeInOut(o, r);

default:
return -(o /= r) * (o - 2);
}
};
e._PiOver2 = .5 * Math.PI;
e._TwoPi = 2 * Math.PI;
return e;
}();
t.EaseManager = e;
var i = function() {
function t() {}
t.easeIn = function(e, i) {
return 1 - t.easeOut(i - e, i);
};
t.easeOut = function(t, e) {
return (t /= e) < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
};
t.easeInOut = function(e, i) {
return e < .5 * i ? .5 * t.easeIn(2 * e, i) : .5 * t.easeOut(2 * e - i, i) + .5;
};
return t;
}();
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {}
t.Linear = 0;
t.SineIn = 1;
t.SineOut = 2;
t.SineInOut = 3;
t.QuadIn = 4;
t.QuadOut = 5;
t.QuadInOut = 6;
t.CubicIn = 7;
t.CubicOut = 8;
t.CubicInOut = 9;
t.QuartIn = 10;
t.QuartOut = 11;
t.QuartInOut = 12;
t.QuintIn = 13;
t.QuintOut = 14;
t.QuintInOut = 15;
t.ExpoIn = 16;
t.ExpoOut = 17;
t.ExpoInOut = 18;
t.CircIn = 19;
t.CircOut = 20;
t.CircInOut = 21;
t.ElasticIn = 22;
t.ElasticOut = 23;
t.ElasticInOut = 24;
t.BackIn = 25;
t.BackOut = 26;
t.BackInOut = 27;
t.BounceIn = 28;
t.BounceOut = 29;
t.BounceInOut = 30;
t.Custom = 31;
return t;
}();
t.EaseType = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.to = function(e, i, n) {
return t.TweenManager.createTween()._to(e, i, n);
};
e.to2 = function(e, i, n, o, r) {
return t.TweenManager.createTween()._to2(e, i, n, o, r);
};
e.to3 = function(e, i, n, o, r, s, a) {
return t.TweenManager.createTween()._to3(e, i, n, o, r, s, a);
};
e.to4 = function(e, i, n, o, r, s, a, h, l) {
return t.TweenManager.createTween()._to4(e, i, n, o, r, s, a, h, l);
};
e.toColor = function(e, i, n) {
return t.TweenManager.createTween()._toColor(e, i, n);
};
e.delayedCall = function(e) {
return t.TweenManager.createTween().setDelay(e);
};
e.shake = function(e, i, n, o) {
return t.TweenManager.createTween()._shake(e, i, n, o);
};
e.isTweening = function(e, i) {
return t.TweenManager.isTweening(e, i);
};
e.kill = function(e, i, n) {
t.TweenManager.killTweens(e, !1, null);
};
e.getTween = function(e, i) {
return t.TweenManager.getTween(e, i);
};
e.catchCallbackExceptions = !0;
return e;
}();
t.GTween = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {
this._startValue = new t.TweenValue();
this._endValue = new t.TweenValue();
this._value = new t.TweenValue();
this._deltaValue = new t.TweenValue();
this._reset();
}
e.prototype.setDelay = function(t) {
this._delay = t;
return this;
};
Object.defineProperty(e.prototype, "delay", {
get: function() {
return this._delay;
},
enumerable: !0,
configurable: !0
});
e.prototype.setDuration = function(t) {
this._duration = t;
return this;
};
Object.defineProperty(e.prototype, "duration", {
get: function() {
return this._duration;
},
enumerable: !0,
configurable: !0
});
e.prototype.setBreakpoint = function(t) {
this._breakpoint = t;
return this;
};
e.prototype.setEase = function(t) {
this._easeType = t;
return this;
};
e.prototype.setEasePeriod = function(t) {
this._easePeriod = t;
return this;
};
e.prototype.setEaseOvershootOrAmplitude = function(t) {
this._easeOvershootOrAmplitude = t;
return this;
};
e.prototype.setRepeat = function(t, e) {
this._repeat = t;
this._yoyo = e;
return this;
};
Object.defineProperty(e.prototype, "repeat", {
get: function() {
return this._repeat;
},
enumerable: !0,
configurable: !0
});
e.prototype.setTimeScale = function(t) {
this._timeScale = t;
return this;
};
e.prototype.setSnapping = function(t) {
this._snapping = t;
return this;
};
e.prototype.setTarget = function(e, i) {
this._target = e;
this._propType = i;
e instanceof t.GObject ? this._node = e.node : e instanceof cc.Node && (this._node = e);
return this;
};
Object.defineProperty(e.prototype, "target", {
get: function() {
return this._target;
},
enumerable: !0,
configurable: !0
});
e.prototype.setUserData = function(t) {
this._userData = t;
return this;
};
Object.defineProperty(e.prototype, "userData", {
get: function() {
return this._userData;
},
enumerable: !0,
configurable: !0
});
e.prototype.onUpdate = function(t, e) {
this._onUpdate = t;
this._onUpdateCaller = e;
return this;
};
e.prototype.onStart = function(t, e) {
this._onStart = t;
this._onStartCaller = e;
return this;
};
e.prototype.onComplete = function(t, e) {
this._onComplete = t;
this._onCompleteCaller = e;
return this;
};
Object.defineProperty(e.prototype, "startValue", {
get: function() {
return this._startValue;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "endValue", {
get: function() {
return this._endValue;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "value", {
get: function() {
return this._value;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "deltaValue", {
get: function() {
return this._deltaValue;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "normalizedTime", {
get: function() {
return this._normalizedTime;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "completed", {
get: function() {
return 0 != this._ended;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(e.prototype, "allCompleted", {
get: function() {
return 1 == this._ended;
},
enumerable: !0,
configurable: !0
});
e.prototype.setPaused = function(t) {
this._paused = t;
return this;
};
e.prototype.seek = function(t) {
if (!this._killed) {
this._elapsedTime = t;
if (this._elapsedTime < this._delay) {
if (!this._started) return;
this._elapsedTime = this._delay;
}
this.update();
}
};
e.prototype.kill = function(t) {
if (!this._killed) {
if (t) {
if (0 == this._ended) {
this._breakpoint >= 0 ? this._elapsedTime = this._delay + this._breakpoint : this._repeat >= 0 ? this._elapsedTime = this._delay + this._duration * (this._repeat + 1) : this._elapsedTime = this._delay + 2 * this._duration;
this.update();
}
this.callCompleteCallback();
}
this._killed = !0;
}
};
e.prototype._to = function(t, e, i) {
this._valueSize = 1;
this._startValue.x = t;
this._endValue.x = e;
this._duration = i;
return this;
};
e.prototype._to2 = function(t, e, i, n, o) {
this._valueSize = 2;
this._startValue.x = t;
this._endValue.x = i;
this._startValue.y = e;
this._endValue.y = n;
this._duration = o;
return this;
};
e.prototype._to3 = function(t, e, i, n, o, r, s) {
this._valueSize = 3;
this._startValue.x = t;
this._endValue.x = n;
this._startValue.y = e;
this._endValue.y = o;
this._startValue.z = i;
this._endValue.z = r;
this._duration = s;
return this;
};
e.prototype._to4 = function(t, e, i, n, o, r, s, a, h) {
this._valueSize = 4;
this._startValue.x = t;
this._endValue.x = o;
this._startValue.y = e;
this._endValue.y = r;
this._startValue.z = i;
this._endValue.z = s;
this._startValue.w = n;
this._endValue.w = a;
this._duration = h;
return this;
};
e.prototype._toColor = function(t, e, i) {
this._valueSize = 4;
this._startValue.color = t;
this._endValue.color = e;
this._duration = i;
return this;
};
e.prototype._shake = function(t, e, i, n) {
this._valueSize = 5;
this._startValue.x = t;
this._startValue.y = e;
this._startValue.w = i;
this._duration = n;
return this;
};
e.prototype._init = function() {
this._delay = 0;
this._duration = 0;
this._breakpoint = -1;
this._easeType = t.EaseType.QuadOut;
this._timeScale = 1;
this._easePeriod = 0;
this._easeOvershootOrAmplitude = 1.70158;
this._snapping = !1;
this._repeat = 0;
this._yoyo = !1;
this._valueSize = 0;
this._started = !1;
this._paused = !1;
this._killed = !1;
this._elapsedTime = 0;
this._normalizedTime = 0;
this._ended = 0;
};
e.prototype._reset = function() {
this._target = null;
this._propType = null;
this._userData = null;
this._node = null;
this._onStart = this._onUpdate = this._onComplete = null;
this._onStartCaller = this._onUpdateCaller = this._onCompleteCaller = null;
};
e.prototype._update = function(t) {
if (!this._node || cc.isValid(this._node)) {
1 != this._timeScale && (t *= this._timeScale);
if (0 != t) if (0 == this._ended) {
this._elapsedTime += t;
this.update();
if (0 != this._ended && !this._killed) {
this.callCompleteCallback();
this._killed = !0;
}
} else {
this.callCompleteCallback();
this._killed = !0;
}
} else this._killed = !0;
};
e.prototype.update = function() {
this._ended = 0;
if (0 != this._valueSize) {
if (!this._started) {
if (this._elapsedTime < this._delay) return;
this._started = !0;
this.callStartCallback();
if (this._killed) return;
}
var e = !1, i = this._elapsedTime - this._delay;
if (this._breakpoint >= 0 && i >= this._breakpoint) {
i = this._breakpoint;
this._ended = 2;
}
if (0 != this._repeat) {
var n = Math.floor(i / this._duration);
i -= this._duration * n;
this._yoyo && (e = n % 2 == 1);
if (this._repeat > 0 && this._repeat - n < 0) {
this._yoyo && (e = this._repeat % 2 == 1);
i = this._duration;
this._ended = 1;
}
} else if (i >= this._duration) {
i = this._duration;
this._ended = 1;
}
this._normalizedTime = t.EaseManager.evaluate(this._easeType, e ? this._duration - i : i, this._duration, this._easeOvershootOrAmplitude, this._easePeriod);
this._value.setZero();
this._deltaValue.setZero();
if (5 == this._valueSize) if (0 == this._ended) {
var o = this._startValue.w * (1 - this._normalizedTime), r = o * (Math.random() > .5 ? 1 : -1), s = o * (Math.random() > .5 ? 1 : -1);
this._deltaValue.x = r;
this._deltaValue.y = s;
this._value.x = this._startValue.x + r;
this._value.y = this._startValue.y + s;
} else {
this._value.x = this._startValue.x;
this._value.y = this._startValue.y;
} else for (var a = 0; a < this._valueSize; a++) {
var h = this._startValue.getField(a), l = h + (this._endValue.getField(a) - h) * this._normalizedTime;
this._snapping && (l = Math.round(l));
this._deltaValue.setField(a, l - this._value.getField(a));
this._value.setField(a, l);
}
if (null != this._target && null != this._propType) if (this._propType instanceof Function) switch (this._valueSize) {
case 1:
this._propType.call(this._target, this._value.x);
break;

case 2:
this._propType.call(this._target, this._value.x, this._value.y);
break;

case 3:
this._propType.call(this._target, this._value.x, this._value.y, this._value.z);
break;

case 4:
this._propType.call(this._target, this._value.x, this._value.y, this._value.z, this._value.w);
break;

case 5:
this._propType.call(this._target, this._value.color);
break;

case 6:
this._propType.call(this._target, this._value.x, this._value.y);
} else 5 == this._valueSize ? this._target[this._propType] = this._value.color : this._target[this._propType] = this._value.x;
this.callUpdateCallback();
} else this._elapsedTime >= this._delay + this._duration && (this._ended = 1);
};
e.prototype.callStartCallback = function() {
if (null != this._onStart) try {
this._onStart.call(this._onStartCaller, this);
} catch (t) {
console.log("FairyGUI: error in start callback > " + t);
}
};
e.prototype.callUpdateCallback = function() {
if (null != this._onUpdate) try {
this._onUpdate.call(this._onUpdateCaller, this);
} catch (t) {
console.log("FairyGUI: error in update callback > " + t);
}
};
e.prototype.callCompleteCallback = function() {
if (null != this._onComplete) try {
this._onComplete.call(this._onCompleteCaller, this);
} catch (t) {
console.log("FairyGUI: error in complete callback > " + t);
}
};
return e;
}();
t.GTweener = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function e() {}
e.createTween = function() {
if (!e._root) {
e._root = new cc.Node("[TweenManager]");
cc.game.addPersistRootNode(e._root);
cc.director.getScheduler().schedule(e.update, e._root, 0, !1);
}
var i;
(i = e._tweenerPool.length > 0 ? e._tweenerPool.pop() : new t.GTweener())._init();
e._activeTweens[e._totalActiveTweens++] = i;
e._totalActiveTweens == e._activeTweens.length && (e._activeTweens.length = e._activeTweens.length + Math.ceil(.5 * e._activeTweens.length));
return i;
};
e.isTweening = function(t, i) {
if (null == t) return !1;
for (var n = null == i || void 0 == i, o = 0; o < e._totalActiveTweens; o++) {
var r = e._activeTweens[o];
if (null != r && r.target == t && !r._killed && (n || r._propType == i)) return !0;
}
return !1;
};
e.killTweens = function(t, i, n) {
if (null == t) return !1;
for (var o = !1, r = e._totalActiveTweens, s = null == n || void 0 == n, a = 0; a < r; a++) {
var h = e._activeTweens[a];
if (null != h && h.target == t && !h._killed && (s || h._propType == n)) {
h.kill(i);
o = !0;
}
}
return o;
};
e.getTween = function(t, i) {
if (null == t) return null;
for (var n = e._totalActiveTweens, o = null == i || void 0 == i, r = 0; r < n; r++) {
var s = e._activeTweens[r];
if (null != s && s.target == t && !s._killed && (o || s._propType == i)) return s;
}
return null;
};
e.update = function(t) {
for (var i = e._activeTweens, n = e._totalActiveTweens, o = -1, r = 0; r < n; r++) {
var s = i[r];
if (null == s) -1 == o && (o = r); else if (s._killed) {
s._reset();
e._tweenerPool.push(s);
i[r] = null;
-1 == o && (o = r);
} else {
s._paused || s._update(t);
if (-1 != o) {
i[o] = s;
i[r] = null;
o++;
}
}
}
if (o >= 0) {
if (e._totalActiveTweens != n) {
var a = n;
n = e._totalActiveTweens - n;
for (r = 0; r < n; r++) i[o++] = i[a++];
}
e._totalActiveTweens = o;
}
return !1;
};
e._activeTweens = new Array(30);
e._tweenerPool = new Array();
e._totalActiveTweens = 0;
return e;
}();
t.TweenManager = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {
this.x = this.y = this.z = this.w = 0;
}
Object.defineProperty(t.prototype, "color", {
get: function() {
return (this.w << 24) + (this.x << 16) + (this.y << 8) + this.z;
},
set: function(t) {
this.x = (16711680 & t) >> 16;
this.y = (65280 & t) >> 8;
this.z = 255 & t;
this.w = (4278190080 & t) >> 24;
},
enumerable: !0,
configurable: !0
});
t.prototype.getField = function(t) {
switch (t) {
case 0:
return this.x;

case 1:
return this.y;

case 2:
return this.z;

case 3:
return this.w;

default:
throw new Error("Index out of bounds: " + t);
}
};
t.prototype.setField = function(t, e) {
switch (t) {
case 0:
this.x = e;
break;

case 1:
this.y = e;
break;

case 2:
this.z = e;
break;

case 3:
this.w = e;
break;

default:
throw new Error("Index out of bounds: " + t);
}
};
t.prototype.setZero = function() {
this.x = this.y = this.z = this.w = 0;
};
return t;
}();
t.TweenValue = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t(t, e, i) {
void 0 === e && (e = 0);
void 0 === i && (i = -1);
this.stringTable = null;
this.version = 0;
this.littleEndian = !1;
-1 == i && (i = t.byteLength - e);
this._bytes = new Uint8Array(t, e, i);
this._view = new DataView(this._bytes.buffer, e, i);
this._pos = 0;
this._length = i;
}
Object.defineProperty(t.prototype, "data", {
get: function() {
return this._bytes;
},
enumerable: !0,
configurable: !0
});
Object.defineProperty(t.prototype, "position", {
get: function() {
return this._pos;
},
set: function(t) {
if (t > this._length) throw "Out of bounds";
this._pos = t;
},
enumerable: !0,
configurable: !0
});
t.prototype.skip = function(t) {
this._pos += t;
};
t.prototype.validate = function(t) {
if (this._pos + t > this._length) throw "Out of bounds";
};
t.prototype.readByte = function() {
this.validate(1);
return this._view.getInt8(this._pos++);
};
t.prototype.readUbyte = function() {
return this._bytes[this._pos++];
};
t.prototype.readBool = function() {
return 1 == this.readByte();
};
t.prototype.readShort = function() {
this.validate(2);
var t = this._view.getInt16(this._pos, this.littleEndian);
this._pos += 2;
return t;
};
t.prototype.readUshort = function() {
this.validate(2);
var t = this._view.getUint16(this._pos, this.littleEndian);
this._pos += 2;
return t;
};
t.prototype.readInt = function() {
this.validate(4);
var t = this._view.getInt32(this._pos, this.littleEndian);
this._pos += 4;
return t;
};
t.prototype.readUint = function() {
this.validate(4);
var t = this._view.getUint32(this._pos, this.littleEndian);
this._pos += 4;
return t;
};
t.prototype.readFloat = function() {
this.validate(4);
var t = this._view.getFloat32(this._pos, this.littleEndian);
this._pos += 4;
return t;
};
t.prototype.readString = function(t) {
void 0 == t && (t = this.readUshort());
this.validate(t);
for (var e = "", i = this._pos + t, n = 0, o = String.fromCharCode, r = this._bytes, s = this._pos; s < i; ) {
(n = r[s++]) < 128 ? 0 != n && (e += o(n)) : e += o(n < 224 ? (63 & n) << 6 | 127 & r[s++] : n < 240 ? (31 & n) << 12 | (127 & r[s++]) << 6 | 127 & r[s++] : (15 & n) << 18 | (127 & r[s++]) << 12 | r[s++] << 6 & 127 | 127 & r[s++]);
0;
}
this._pos += t;
return e;
};
t.prototype.readS = function() {
var t = this.readUshort();
return 65534 == t ? null : 65533 == t ? "" : this.stringTable[t];
};
t.prototype.writeS = function(t) {
var e = this.readUshort();
65534 != e && 65533 != e && (this.stringTable[e] = t);
};
t.prototype.readColor = function(t) {
var e = this.readUbyte(), i = this.readUbyte(), n = this.readUbyte(), o = this.readUbyte();
return new cc.Color(e, i, n, t ? o : 255);
};
t.prototype.readChar = function() {
var t = this.readUshort();
return String.fromCharCode(t);
};
t.prototype.readBuffer = function() {
var e = this.readUint();
this.validate(e);
var i = new t(this._bytes.buffer, this._bytes.byteOffset + this._pos, e);
i.stringTable = this.stringTable;
i.version = this.version;
this._pos += e;
return i;
};
t.prototype.seek = function(t, e) {
var i = this._pos;
this._pos = t;
if (e < this.readByte()) {
var n;
if (1 == this.readByte()) {
this._pos += 2 * e;
n = this.readUshort();
} else {
this._pos += 4 * e;
n = this.readUint();
}
if (n > 0) {
this._pos = t + n;
return !0;
}
this._pos = i;
return !1;
}
this._pos = i;
return !1;
};
return t;
}();
t.ByteBuffer = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {
this.matrix = new Array(t.LENGTH);
this.reset();
}
t.create = function(e, i, n, o) {
var r = new t();
r.adjustColor(e, i, n, o);
return r;
};
t.prototype.reset = function() {
for (var e = 0; e < t.LENGTH; e++) this.matrix[e] = t.IDENTITY_MATRIX[e];
};
t.prototype.invert = function() {
this.multiplyMatrix([ -1, 0, 0, 0, 255, 0, -1, 0, 0, 255, 0, 0, -1, 0, 255, 0, 0, 0, 1, 0 ]);
};
t.prototype.adjustColor = function(t, e, i, n) {
this.adjustHue(n);
this.adjustContrast(e);
this.adjustBrightness(t);
this.adjustSaturation(i);
};
t.prototype.adjustBrightness = function(t) {
t = 255 * this.cleanValue(t, 1);
this.multiplyMatrix([ 1, 0, 0, 0, t, 0, 1, 0, 0, t, 0, 0, 1, 0, t, 0, 0, 0, 1, 0 ]);
};
t.prototype.adjustContrast = function(t) {
var e = (t = this.cleanValue(t, 1)) + 1, i = 128 * (1 - e);
this.multiplyMatrix([ e, 0, 0, 0, i, 0, e, 0, 0, i, 0, 0, e, 0, i, 0, 0, 0, 1, 0 ]);
};
t.prototype.adjustSaturation = function(e) {
e = this.cleanValue(e, 1);
var i = 1 - (e += 1), n = i * t.LUMA_R, o = i * t.LUMA_G, r = i * t.LUMA_B;
this.multiplyMatrix([ n + e, o, r, 0, 0, n, o + e, r, 0, 0, n, o, r + e, 0, 0, 0, 0, 0, 1, 0 ]);
};
t.prototype.adjustHue = function(e) {
e = this.cleanValue(e, 1);
e *= Math.PI;
var i = Math.cos(e), n = Math.sin(e);
this.multiplyMatrix([ t.LUMA_R + i * (1 - t.LUMA_R) + n * -t.LUMA_R, t.LUMA_G + i * -t.LUMA_G + n * -t.LUMA_G, t.LUMA_B + i * -t.LUMA_B + n * (1 - t.LUMA_B), 0, 0, t.LUMA_R + i * -t.LUMA_R + .143 * n, t.LUMA_G + i * (1 - t.LUMA_G) + .14 * n, t.LUMA_B + i * -t.LUMA_B + -.283 * n, 0, 0, t.LUMA_R + i * -t.LUMA_R + n * -(1 - t.LUMA_R), t.LUMA_G + i * -t.LUMA_G + n * t.LUMA_G, t.LUMA_B + i * (1 - t.LUMA_B) + n * t.LUMA_B, 0, 0, 0, 0, 0, 1, 0 ]);
};
t.prototype.concat = function(e) {
e.length == t.LENGTH && this.multiplyMatrix(e);
};
t.prototype.clone = function() {
var e = new t();
e.copyMatrix(this.matrix);
return e;
};
t.prototype.copyMatrix = function(e) {
for (var i = t.LENGTH, n = 0; n < i; n++) this.matrix[n] = e[n];
};
t.prototype.multiplyMatrix = function(t) {
for (var e = [], i = 0, n = 0; n < 4; ++n) {
for (var o = 0; o < 5; ++o) e[i + o] = t[i] * this.matrix[o] + t[i + 1] * this.matrix[o + 5] + t[i + 2] * this.matrix[o + 10] + t[i + 3] * this.matrix[o + 15] + (4 == o ? t[i + 4] : 0);
i += 5;
}
this.copyMatrix(e);
};
t.prototype.cleanValue = function(t, e) {
return Math.min(e, Math.max(-e, t));
};
t.IDENTITY_MATRIX = [ 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0 ];
t.LENGTH = t.IDENTITY_MATRIX.length;
t.LUMA_R = .299;
t.LUMA_G = .587;
t.LUMA_B = .114;
return t;
}();
t.ColorMatrix = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {
this._readPos = 0;
this._handlers = {};
this._handlers.url = this.onTag_URL;
this._handlers.img = this.onTag_IMG;
this._handlers.b = this.onTag_Simple;
this._handlers.i = this.onTag_Simple;
this._handlers.u = this.onTag_Simple;
this._handlers.color = this.onTag_COLOR;
this._handlers.size = this.onTag_SIZE;
}
t.prototype.onTag_URL = function(t, e, i) {
if (e) {
n = "";
this.linkColor && (n += "</color>");
this.linkUnderline && (n += "</u>");
return n += "</on>";
}
var n = void 0;
if (null != i) n = '<on click="onClickLink" param="' + i + '">'; else {
n = '<on click="onClickLink" param="' + this.getTagText() + '">';
}
this.linkUnderline && (n += "<u>");
this.linkColor && (n += "<color=" + this.linkColor + ">");
return n;
};
t.prototype.onTag_IMG = function(t, e, i) {
if (e) return null;
var n = this.getTagText(!0);
return n ? '<img src="' + n + '"/>' : null;
};
t.prototype.onTag_Simple = function(t, e, i) {
return e ? "</" + t + ">" : "<" + t + ">";
};
t.prototype.onTag_COLOR = function(t, e, i) {
if (e) return "</color>";
this.lastColor = i;
return "<color=" + i + ">";
};
t.prototype.onTag_FONT = function(t, e, i) {
return e ? "</font>" : '<font face="' + i + '">';
};
t.prototype.onTag_SIZE = function(t, e, i) {
if (e) return "</size>";
this.lastSize = i;
return "<size=" + i + ">";
};
t.prototype.getTagText = function(t) {
for (var e, i = this._readPos, n = ""; -1 != (e = this._text.indexOf("[", i)); ) {
if (92 != this._text.charCodeAt(e - 1)) {
n += this._text.substring(i, e);
break;
}
n += this._text.substring(i, e - 1);
n += "[";
i = e + 1;
}
if (-1 == e) return null;
t && (this._readPos = e);
return n;
};
t.prototype.parse = function(t, e) {
this._text = t;
this.lastColor = null;
this.lastSize = null;
for (var i, n, o, r, s, a, h, l = 0, c = ""; -1 != (i = this._text.indexOf("[", l)); ) if (i > 0 && 92 == this._text.charCodeAt(i - 1)) {
c += this._text.substring(l, i - 1);
c += "[";
l = i + 1;
} else {
c += this._text.substring(l, i);
l = i;
if (-1 == (i = this._text.indexOf("]", l))) break;
o = "/" == this._text.charAt(l + 1);
r = this._text.substring(o ? l + 2 : l + 1, i);
this._readPos = i + 1;
s = null;
a = null;
if (-1 != (n = r.indexOf("="))) {
s = r.substring(n + 1);
r = r.substring(0, n);
}
r = r.toLowerCase();
null != (h = this._handlers[r]) ? null == (a = h.call(this, r, o, s)) || e || (c += a) : c += this._text.substring(l, this._readPos);
l = this._readPos;
}
l < this._text.length && (c += this._text.substr(l));
this._text = null;
return c;
};
t.inst = new t();
return t;
}();
t.UBBParser = e;
})(fgui || (fgui = {}));

(function(t) {
var e = function() {
function t() {}
t.startsWith = function(t, e, i) {
if (t) {
if (t.length < e.length) return !1;
t = t.substring(0, e.length);
return i ? t.toLowerCase() == e.toLowerCase() : t == e;
}
return !1;
};
t.encodeHTML = function(t) {
return t ? t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&apos;") : "";
};
t.clamp = function(t, e, i) {
t < e ? t = e : t > i && (t = i);
return t;
};
t.clamp01 = function(t) {
t > 1 ? t = 1 : t < 0 && (t = 0);
return t;
};
t.lerp = function(t, e, i) {
return t + i * (e - t);
};
t.getTime = function() {
return new Date().getMilliseconds() / 1e3;
};
t.toGrayed = function(t) {
var e = .299 * t.getR() + .587 * t.getG() + .114 * t.getB();
return new cc.Color(e, e, e, t.getA());
};
return t;
}();
t.ToolSet = e;
})(fgui || (fgui = {}));