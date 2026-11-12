<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html><html lang="ko"><head><meta charset="UTF-8"><title>Ajax JSON/JSP 비교</title></head>
<body><h1>Ajax JSON/JSP 비교</h1><p>Network 탭에서 응답 헤더와 본문을 비교하세요.</p>
<button data-endpoint="broken">오류: JSP 응답</button><button data-endpoint="body">해결: ResponseBody</button>
<button data-endpoint="named-view">해결: 이름 기반 JSON View</button><button data-endpoint="direct-view">해결: 직접 JSON View</button>
<pre id="output" aria-live="polite"></pre><script src="${pageContext.request.contextPath}/webjars/jquery/3.7.1/jquery.min.js"></script>
<script>$(function(){$('button[data-endpoint]').on('click',function(){var endpoint=$(this).attr('data-endpoint');$.ajax({url:'${pageContext.request.contextPath}/demo/'+endpoint,method:'GET',dataType:'json'}).done(function(data,textStatus,xhr){$('#output').text('HTTP '+xhr.status+'\n'+textStatus+'\n'+JSON.stringify(data));}).fail(function(xhr,textStatus,errorThrown){$('#output').text('HTTP '+xhr.status+'\n'+textStatus+'\n'+errorThrown+'\n'+xhr.responseText);});});});</script>
</body></html>

