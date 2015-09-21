<!--Define the macro-->
<define name="chartShow">
	<div class="box-wrap">
		<div class="box-head">
			<h3 class="title">待办统计</h3>
			<div class="options">
				<div class="tools">
					<span class="set"><i class="fa fa-cog"></i></span>
					<span class="refresh"><i class="fa fa-refresh"></i></span>
					<span class="next"><i class="fa fa-chevron-right"></i></span>
				</div>
			</div>
		</div>
		<div class="box-body">
			<div class="chart-wrap J_chartShow"></div>
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
						<div lazy-load-wrap="chartShow"><%-o.micro.chartShow()%></div>
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
		<%-o.micro.chartShow()%>
	<%}%>
<%}else{%>
	<%-o.micro.chartShow()%>
<%}%>