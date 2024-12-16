var fs = require("fs");

const _0x41f6 = [
  "log",
  "substr",
  "charCodeAt",
  "split",
  "binary",
  "indexOf",
  "min",
  "fromCharCode",
  "Encrypted\x20Company\x20File\x20is\x20corrupted.\x20Please\x20call\x20LEE\x20SYSTEM\x20TECHONOLOGY\x20for\x20support.",
  "length",
  "charAt",
];
(function (_0x38cd85, _0x41f696) {
  const _0x267cb1 = function (_0x12fff8) {
    while (--_0x12fff8) {
      _0x38cd85["push"](_0x38cd85["shift"]());
    }
  };
  _0x267cb1(++_0x41f696);
})(_0x41f6, 0x152);

const _0x267c = function (_0x38cd85, _0x41f696) {
  _0x38cd85 = _0x38cd85 - 0x0;
  let _0x267cb1 = _0x41f6[_0x38cd85];
  return _0x267cb1;
};

let chksum = 0x0;
function DecryptCom(_0x3d6cd4) {
  let _0x2ad473;
  try {
    decrypt = !![];
    var _0x53fd5e = DecryptFile(_0x3d6cd4);
    _0x53fd5e = _0x53fd5e[_0x267c("0x4")](
      0x0,
      Math[_0x267c("0x9")](0x136, _0x53fd5e["length"])
    );
    if (isCheckSumOK(chksum, _0x53fd5e)) {
      console[_0x267c("0x3")](_0x267c("0x0"));
    } else {
      let _0x591e9d = _0x53fd5e[_0x267c("0x8")]("|") - 0xb;
      let _0x3f5920 = _0x53fd5e[_0x267c("0x4")](0xa, _0x591e9d);
      let _0x3c9ce8 = _0x3f5920;
      _0x2ad473 = _0x3c9ce8[_0x267c("0x6")]("^");
    }
  } catch (_0x36a980) {
    console[_0x267c("0x3")](_0x36a980);
  }
  return _0x2ad473;
}

function DecryptFile(_0x24c7de) {
  let _0x5a24a6 = "";
  try {
    var _0x5d4902 = fs["readFileSync"](_0x24c7de, { encoding: _0x267c("0x7") });
    for (let _0x1aaede = 0x0; _0x1aaede < _0x5d4902[_0x267c("0x1")]; ) {
      _0x5a24a6 += String[_0x267c("0xa")](
        DecodeAs(
          _0x5d4902["charAt"](_0x1aaede),
          _0x5d4902[_0x267c("0x2")](_0x1aaede + 0x1)
        )
      );
      _0x1aaede += 0x2;
    }
    chksum = parseInt(
      _0x5a24a6[_0x267c("0x4")](_0x5a24a6[_0x267c("0x1")] - 0x6)
    );
  } catch (_0x1124b6) {
    console["log"](_0x1124b6);
  }
  return _0x5a24a6;
}

function isCheckSumOK(_0x599e81, _0xba0bf6) {
  let _0xd1338 = !![];
  chksum = 0x0;
  for (
    let _0x1ad581 = 0x0;
    _0x1ad581 < _0xba0bf6[_0x267c("0x1")];
    _0x1ad581++
  ) {
    chksum += _0xba0bf6[_0x267c("0x5")](_0xba0bf6["charAt"](_0x1ad581));
  }
  if (chksum != _0x599e81 || _0x599e81 == 0x0) {
    _0xd1338 = ![];
    return _0xd1338;
  }
  return _0xd1338;
}

function DecodeAs(_0x3c28d9, _0x4f9dbb) {
  let _0x5db94c = 0x0;
  let _0x5b7c51 = 0x0;
  let _0x403fb6 = 0x0;
  _0x5b7c51 = _0x3c28d9[_0x267c("0x5")](0x0);
  _0x403fb6 = _0x4f9dbb[_0x267c("0x5")](0x0);
  if (_0x403fb6 < 0x82) {
    _0x403fb6 = _0x403fb6 + 0xc8;
  }
  _0x5db94c = _0x403fb6 - _0x5b7c51;
  retval = _0x5db94c;
  return retval;
}

eval(
  (function (x) {
    var d = "";
    var p = 0;
    while (p < x.length) {
      if (x.charAt(p) != "`") d += x.charAt(p++);
      else {
        var l = x.charCodeAt(p + 3) - 28;
        if (l > 4)
          d += d.substr(
            d.length -
              x.charCodeAt(p + 1) * 96 -
              x.charCodeAt(p + 2) +
              3104 -
              l,
            l
          );
        else d += "`";
        p += 4;
      }
    }
    return d;
  })(
    'function js_decrypt(xcode){var xseccde;x` ""=` 6!.trim().toUpperCase();if(` ?#.length<39){return"Invalid L` 5!.";}` i%` M#replace(/-/g,"");`!:!len` 9%` p";if(proc04`!\'$,xlen)=="INVALID"`!-%ERROR: ` 1# CODE`!/\'` a!1` ^$);xNSecCde="";`!%0for(i=0;i<xlen;i++){xC` a$2`"U%substr(i,1)` j\'` v$+xCde;}`!\\" ` .$;}`$ %`!N%hcde){xret`!M!` +!1=` ""` }$0,3)` 4#2` -*ing(3);xStrCoun` _!`!x&3`!x#char` Q#1`!m(` M\'` Y%.concat`#x"2(` W!));}x` B"parseInt(` H%`!Q%b`"}"3`".#2,` M");$`"9!` >$;`"m$ret`"a,`!(${xasc2=` (!.charCodeAt(0);switch(` <!){case 80:`#:"1";break;` 2!79` 0#2` *)87` 0#3` *)6` F$4` @*2` 0#5` @*` ]$6`!%*` F$7` @*5` 0#8` @*8` 0#9`!%*4` 0#0` *)4` ]$-` @*8:` ""9` ""90` ""75` *"76` )#`!j$` m%default` 0#`(o$` 6#`\'2%`$3/3`%8!ing`$z${`$|"`(k#1`&(!ing`(k$x=` 2!/2-0.1` >!2=Math.round(x,0`+R"len1<2`(&#` ]#`%`*if(`!-"<1` \'<len1>`!\'!*2){` @#`!Q&`(q%`\'#ingAdj` 0+ing(1);}else` Y&""` ?/;}xLen` &\'Adj`"W%mid=` 8#/2+1`-/"code=new Array`)p"10=1;i10<=`"A";i10`)}!pos=2` =#` >!<=xmid-1;i1`*="ode[i1]`!3(`"=#xpos-1`"D!pos=xpos+2;}` (!1` n"2` i!;i2<`!`$;i2` m\'2` LHnew`+~%2=1` b0new=xnew+` w%;}`#H(new;`$y"new;}`$~(1+`$!`&d7`0D+{`!D!3=0;i3`/M#3`!@!`+]"`/H#`+Z\'i3`+Q16`(j#67`(k"6`)*#72`(x5`*>$`,\'$`,F$`+R$`*G$`,0$`)y4`)b*`3e$`)b+`)k#"OK";}'
  )
);

module.exports = {
  DecryptCom: DecryptCom,
  js_decrypt: js_decrypt,
};
