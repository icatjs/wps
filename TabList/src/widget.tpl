<!--Define the macro-->
<define name="sptasks">
	<div class="box-wrap">
		<div class="box-head">
			<h3 class="title"><%-o.boxTitle%></h3>
			<div class="options">
				<div class="tabs">
					<ul>
						<%_.each(o.boxTabs, function(item, i){%>
						<li <%if(i==0){%>class="active"<%}%>><span><%-item%></span></li>
						<%})%>
					</ul>
				</div>
			</div>
		</div>
		<div class="box-body">
			<%if(o.dataType===0){%>
			<div class="task-list">
				<ul>
					<li style="border-left-color:#e8b110;">
						<a href="">根据轻型商用车公司技术部所提的QRQC单94930324...</a>
						<div class="options">
							<i class="fa fa-pencil"></i>
							<i class="fa fa-trash-o"></i>
							<i class="fa fa-flag"></i>
						</div>
					</li>
					<li style="border-left-color:#d53f40;">
						<a href="">根据轻型商用车公司技术部所提的QRQC单94930324...</a>
						<div class="options">
							<i class="fa fa-pencil"></i>
							<i class="fa fa-trash-o"></i>
							<i class="fa fa-flag"></i>
						</div>
					</li>
					<li style="border-left-color:#aabbc3;">
						<a href="">根据轻型商用车公司技术部所提的QRQC单94930324...</a>
						<div class="options">
							<i class="fa fa-pencil"></i>
							<i class="fa fa-trash-o"></i>
							<i class="fa fa-flag"></i>
						</div>
					</li>
				</ul>
			</div>
			<%}%>
			<%if(o.dataType===1){%>
			<div class="file-list">
				<table>
					<tr>
						<th width="4%"></th>
						<th width="12%">信息类别</th>
						<th>标题</th>
						<th width="10%">发布人</th>
						<th width="12%">发布人部门</th>
						<th width="12%">发布时间</th>
					</tr>
					<%_.each([1,2,3], function(){%>
					<tr>
						<td><span class="icon"><i class="fa fa-eye"></i></span></td>
						<td>信息类</td>
						<td><a href="" class="subject">根据轻型商用车公司技术部...</a href=""></td>
						<td>李菲</td>
						<td>工程数据科</td>
						<td>2015.05.24</td>
					</tr>
					<%})%>
				</table>
			</div>
			<%}%>
			<%if(o.dataType==2){%>
			<div class="info-list J_infoList">
				<dl>
					<dt class="open"><i class="fa fa-caret-down"></i> 接收到的文件主要内容1</dt>
					<dd>
						<h3>主要内容描述标题</h3>
						<div class="desc">主要内容</div>
					</dd>
					<dt><i class="fa fa-caret-right"></i> 接收到的文件主要内容2</dt>
					<dd>
						<h3>主要内容描述标题</h3>
						<div class="desc">主要内容</div>
					</dd>
					<dt><i class="fa fa-caret-right"></i> 接收到的文件主要内容3</dt>
					<dd>
						<h3>主要内容描述标题</h3>
						<div class="desc">主要内容</div>
					</dd>
				</dl>
			</div>
			<%}%>
		</div>
	</div>
</define>

<!--backbone template-->
<%if(o.displayType==1){%>
	<%if(o.__toolRender__){%>
		<span class="J_handleBtn"><!-- data-toggle="modal" data-target="#myModal"-->
			<i title="<%-o.btnText%>" class="fa <%-o.cla? o.cla : 'fa-bookmark'%>"></i>
			<!--<b title="<%-o.btnText%>">click me...</b>-->
		</span>
	<%}else{%>
		<div class="modal fade" id="<%-o.modalId || 'myModal'%>" role="dialog">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
						<h4 class="modal-title" id="myModalLabel">Modal title</h4>
					</div>
					<div class="modal-body">
						<div lazy-load-wrap="sptasks"><%-o.micro.sptasks()%></div>
					</div>
				</div>
			</div>
		</div>
	<%}%>
<%}else if(o.displayType==2){%>
	<%if(o.__toolRender__){%>
	<span class="J_handleBtn">
		<b title="<%-o.btnText%>">click me...</b>
	</span>
	<%}else{%>
		<%-o.micro.sptasks()%>
	<%}%>
<%}else{%>
	<%-o.micro.sptasks()%>
<%}%>