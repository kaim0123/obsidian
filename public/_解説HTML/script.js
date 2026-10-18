// 解説HTML 共通スクリプト：h2/h3 からページ内目次を作り、現在位置を強調する
(function(){
  var list=document.getElementById("toc-list"), links=[];
  document.querySelectorAll("main h2, main h3").forEach(function(h,i){
    if(!h.id) h.id="h-"+i;
    var a=document.createElement("a");
    a.href="#"+h.id; a.textContent=h.textContent;
    if(h.tagName==="H3") a.className="lv3";
    var li=document.createElement("li"); li.appendChild(a); list.appendChild(li); links.push([h,a]);
  });
  function spy(){
    var y=window.scrollY+100, cur=null;
    links.forEach(function(p){ if(p[0].offsetTop<=y) cur=p; });
    links.forEach(function(p){ p[1].classList.toggle("active",p===cur); });
  }
  window.addEventListener("scroll",spy,{passive:true}); spy();
  var toc=document.getElementById("toc");
  document.querySelector(".toc-btn").addEventListener("click",function(){toc.classList.toggle("open");});
  toc.addEventListener("click",function(e){ if(e.target.tagName==="A") toc.classList.remove("open"); });
})();
