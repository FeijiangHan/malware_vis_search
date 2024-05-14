export default function create_msv(d3,csv, place) {
    document.querySelector(place).innerHTML = '';
    var width = 3000;
    var height = 2000;
    // length = 800;  
    var nodenum = 0;
    var svg = d3.select(place).append("svg:svg")
        .attr("width", width + 80)
        .attr("height", height + 40)
        // .attr("transform", "translate(330,20)");
    var gcircle = svg.append("g")
    var innerg=gcircle.append('g');
    svg.call(d3.behavior.zoom().scaleExtent([0.1, 20]).on('zoom', function() {
        // console.log(d3.event)
        var scale = d3.event.scale
        var translate = d3.event.translate
        innerg.attr('transform', 'translate(' + translate[0]*scale+ ', ' + translate[1]*scale + ') scale(' + scale + ')');
    }))
    gcircle=innerg;
        // .attr("transform", "translate(50,0)");
        var links=csv;

        //关系分组  
        var linkGroup = {};  
        //对连接线进行统计和分组，不区分连接线的方向，只要属于同两个实体，即认为是同一组  
        var linkmap = {}  
        for(var i=0; i<links.length; i++){  
            var key = links[i].source<links[i].target?links[i].source+':'+links[i].target:links[i].target+':'+links[i].source;  
            if(!linkmap.hasOwnProperty(key)){  
                linkmap[key] = 0;  
            }  
            linkmap[key]+=1;  
            if(!linkGroup.hasOwnProperty(key)){  
                linkGroup[key]=[];  
            }  
            linkGroup[key].push(links[i]);  
        }  
        //为每一条连接线分配size属性，同时对每一组连接线进行编号  
        for(var i=0; i<links.length; i++){  
            var key = links[i].source<links[i].target?links[i].source+':'+links[i].target:links[i].target+':'+links[i].source;  
            links[i].size = linkmap[key];  
            //同一组的关系进行编号  
            var group = linkGroup[key];  
            var keyPair = key.split(':');  
            var type = 'noself';//标示该组关系是指向两个不同实体还是同一个实体  
            if(keyPair[0]==keyPair[1]){  
                type = 'self';  
            }  
            //给节点分配编号  
            setLinkNumber(group,type);  
        }  
        
      
        var nodes = {};  
      
        // Compute the distinct nodes from the links.  
        links.forEach(function(link) {  
          link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,node_id:nodenum++});  
          link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,caller:link.source.name,argc:link.argc,argv:link.argv,return:link.return,index:link.index,dynamic:link.dynamic,node_id:nodenum++});  
          //nodenum++;
        });  

        var nodes_info=d3.values(nodes);
        // console.log(nodes); 
        // console.log(nodes_info); 

        var defs=svg.append("defs");
        var arrowMarker=defs.append("marker")  
            .attr("id", "arrow")  
            .attr("viewBox", "0 0 10 10")  
            .attr("refX", 7)  
            .attr("refY", 6)  
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth", 9)  
            .attr("markerHeight", 9)  
            .attr("orient", "auto")  
            .append("path")  
            //.attr("d", "M0,-5L10,0L0,5");
            .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            .attr("fill","#696969")

        var arrowMarker1=defs.append("marker")  
            .attr("id", "arrow1")  
            .attr("viewBox", "0 -5 10 10")  
            .attr("refX", 7)  
            .attr("refY", 0)  
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth", 8.5)  
            .attr("markerHeight", 8.5)  
            .attr("orient", "auto")  
            .append("path")  
            .attr("d", "M0,-5L10,0L0,5Z")
            //.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
            .attr("fill","#696969")

        var startx=200,
            endx=width-100,
            starty=20;
        var jiange=height/nodes_info.length;
        for(var i=0;i<nodes_info.length;i++){
            var temp=nodes_info[i];

            gcircle.append("text")
                  .text(function(d){
                    return temp.name;
                  })
                  .attr('dx', startx-12)
                  .attr('dy', starty+3)
                  //.style('fill', 'grey')
                  .style("text-anchor", "end");

            //画水平轴
            gcircle.append("line")
                .attr("x1", startx)
                .attr("y1", starty)
                .attr("x2", endx+800)
                .attr("y2", starty)
                .attr("stroke", "#ccc")
                .attr("stroke-width", "2.5px")
                .classed("horizental",true);
            
            gcircle.append("circle")
                .attr("cx", startx)
                .attr("cy", starty)
                .attr("r", 6)
                .attr("fill", "#ddd")
                .attr("stroke", "#ddd")
                // .attr("fill", d=>{
                //     if(temp.name == "__main__") return "#fff"
                //     return "rgb(211, 228, 243)"
                // })
                // .attr("stroke", d=>{
                //     if(temp.name == "__main__") return "rgb(176, 0, 0)"
                //     return "rgb(160, 202, 227)"
                // });
            

            starty+=22;
        }

        var sx_num=105;
        for(var j=0;j<links.length;j++){
            var templink=links[j];
            var line_s=+templink.source.node_id;
            var line_e=+templink.target.node_id;
            var line_sy=10+line_s*22;
            var line_ey=10+line_e*22;
            var dynamicstr=templink.dynamic.substr(1,templink.dynamic.length-2);
            var dynamicstr1 = dynamicstr.split( ', ' );
            
            sx_num+=6;
            var ispolluted=0;
            gcircle.append("line")
                .attr("x1",sx_num+100)
                .attr("y1",line_sy+10)
                .attr("x2",sx_num+100)
                .attr("y2",line_ey+10)
                .attr("marker-end",function(d){
                    if(dynamicstr1[0]==""||dynamicstr1.length<templink.target.argc){
                        return "url(#arrow)"
                    }else{
                        
                        // for(var a=0;a<dynamicstr1.length;a++){
                        //     if(dynamicstr1[a]!="0"){
                        //         ispolluted=1;
                        //         return "url(#arrow1)"
                        //     }
                        // }
                        return "url(#arrow)"
                    }
                })
                .attr("stroke", function(d){
                    if(ispolluted==0||templink.source.name=="__main__"){
                        return "#696969";
                    }else{
                        for(var a=0;a<dynamicstr1.length;a++){
                            var dynamicstrt=templink.dynamic.substr(1,templink.source.dynamic.length-2);
                            var dynamicstrt1 = dynamicstrt.split( ', ' );
                            if(dynamicstr1[a]!="0"&& dynamicstrt1[0]==dynamicstr1[a]){

                                return "rgb(152,214,224)"
                            }else{
                                return "#696969";
                            }
                        }
                    }
                })
                .attr("stroke-width", "1px");


        }   

        function setLinkNumber(group,type){  
            if(group.length==0) return;  
            //对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分  
            var linksA = [], linksB = [];  
            for(var i = 0;i<group.length;i++){  
                var link = group[i];  
                if(link.source < link.target){  
                    linksA.push(link);  
                }else{  
                    linksB.push(link);  
                }  
            }  
            //确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。  
            //特殊情况：当关系都是连接到同一个实体时，不平分  
            var maxLinkNumber = 0;  
            if(type=='self'){  
                maxLinkNumber = group.length;  
            }else{  
                maxLinkNumber = group.length%2==0?group.length/2:(group.length+1)/2;  
            }  
            //如果两个方向的关系数量一样多，直接分别设置编号即可  
            if(linksA.length==linksB.length){  
                var startLinkNumber = 1;  
                for(var i=0;i<linksA.length;i++){  
                    linksA[i].linknum = startLinkNumber++;  
                }  
                startLinkNumber = 1;  
                for(var i=0;i<linksB.length;i++){  
                    linksB[i].linknum = startLinkNumber++;  
                }  
            }else{//当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号  
                //如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）  
                var biggerLinks,smallerLinks;  
                if(linksA.length>linksB.length){  
                    biggerLinks = linksA;  
                    smallerLinks = linksB;  
                }else{  
                    biggerLinks = linksB;  
                    smallerLinks = linksA;  
                }  
      
                var startLinkNumber = maxLinkNumber;  
                for(var i=0;i<smallerLinks.length;i++){  
                    smallerLinks[i].linknum = startLinkNumber--;  
                }  
                var tmpNumber = startLinkNumber;  
      
                startLinkNumber = 1;  
                var p = 0;  
                while(startLinkNumber<=maxLinkNumber){  
                    biggerLinks[p++].linknum = startLinkNumber++;  
                }  
                //开始负编号  
                startLinkNumber = 0-tmpNumber;  
                for(var i=p;i<biggerLinks.length;i++){  
                    biggerLinks[i].linknum = startLinkNumber++;  
                }  
            }   
        }  
        var links=d3.select(place).select('svg').select('g').selectAll('line')[0];
        var x2=parseInt(links[links.length-1].getAttribute("x2"))+80
        // console.log("x2",links[links.length-1].getAttribute("x2"),x2)

        gcircle.selectAll(".horizental").attr("x2", x2-20)
        // svg.attr('width',x2)
    //限制宽度

}