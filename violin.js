//inspired by https://palomavaleva.com/en/violin-chords/
//those are static images so i reworked into d3+svg
//so i can use the positioning data to feed into
//later tools for finger layout
function vdata(startx,starty,position) {
var stringtable=[[//first position
    ['G3','G#','A','A#','B','C','C#','D','D#','O'],
    ['D4','D#','E','F','F#','G','G#','A','A#','O'],
    ['A4','A#','B','C','C#','D','D#','E','E#','O'],
    ['E5','F','F#','G','G#','A','A#','B','B#','O'],
    ['', 'L1','1','L2','2','3','H3','4']//label
],[//third tbd?
    ['D4','D#','E','F','F#','G','G#','A','??','O'],
    ['A4','A#','B','C','C#','D','D#','E','??','O'],
    ['E5','F','F#','G','G#','A','A#','B','B#','O'],
    ['B5','C','C#','D','D#','E','F','F#','??','O'],
    ['', 'L1','1','L2','2','3','H3','4']//label
]];
// not entirely sure how i want to map all positions.
// need a position slider but finger positions shift too
	var data = new Array();
	var ypos = 1+starty;
	var width = 30;
	var xpos = 1+width/2+startx;
	var height = 40;
    var pg = d3.line();
    for (var vs = 0; vs < 4; vs++) {
		data.push( new Array() );
        for (var fret = 0; fret < 10; fret++) {
            var pdata=[[xpos,ypos],[xpos,ypos+height-1]];
            var snote=stringtable[position][vs][fret];
            var open=(fret==9)?true:false;
            var label=(fret==0)?true:false;
            data[vs].push({
                path:pg(pdata),
                note:snote,
                lx:xpos-5*snote.length,
                ly:ypos+height*.6,
                cx:xpos,
                cy:ypos+height*.5,
                r:12,
                fill:'#000',
                lfill:label?'#000':'#fff',
                open:open,
                show:label?1:0,//actually css opacity
                label:label,
            });
			ypos += height;
		}
		ypos = 1+starty;
		xpos += width;	
	}
	return data;
}
function buildviolin(w,l,v) {
    var base=d3.select('#violin')
        .append('svg')
        .style('background-color','#fff')
        .attr('width',(w*140)+'px')
        .attr('height',(l*400)+'px')
        .append('g')
    for(var i=0;i<v.length;i++) {
        var [instance,gx,gy,chord,notes]=v[i];
        board(base,instance,gx*140,gy*400,chord,notes);
    }
}
function board(above,instance,gx,gy,chord,notes) {
    // grid positions are 4x10, y0=string label, y9=open marker
    // 30x40 boxes, 15px margin 125x400px boards
    // still need labels right side
    var vd = vdata(gx,gy,0);	
    Object.keys(notes).forEach(function(k){
        var [x,y]=notes[k];
        vd[x][y].show^=1;
    });
        
    var vstring = above.selectAll('.string'+instance)
        .data(vd).enter()
        .append('g')
        .attr('class','string'+instance);

    var border=above
        .append('g')
        .append('path')
        .attr('d',d3.line()([[1+gx,1+gy],[1+gx,400+gy],[125+gx,400+gy],[125+gx,1+gy]]))
        .attr('class','border')
        .style('stroke','black')
        .style('stroke-width',2)
        .style('fill','none');
        
    var fret = vstring.selectAll('.fret'+instance)
        .data(function(d) { return d; }).enter()
        .append('path')
        .attr('d',function(d) { return d.path; })
        .attr('class','fret'+instance)
        .style('stroke','black')
        .style('stroke-width',5)
        .style('opacity',function(d){return d.open||d.label?0:1});

    var vnote=vstring.selectAll('.vnote'+instance)
        .data(function(d){return d}).enter()
        .append('g')
        .attr('class','vnote'+instance)
        .on('click', function(d) {
            d.show^=1;
            d3.select(this).selectAll('circle').style('opacity',d.label?0:d.show);
            d3.select(this).selectAll('text').style('opacity',d.label?1:d.show);
        })
        //.transition()
        //.duration(1200)
        .on('mouseenter', function(d) {
            d3.select(this).selectAll('circle').style('opacity',d.label?0:.6);
            d3.select(this).selectAll('circle').style('fill','#ff6200');
            d3.select(this).selectAll('text').style('opacity',d.label?1:1);
        })
        .on('mouseleave', function(d) {
            d3.select(this).selectAll('circle').style('opacity',d.label?0:d.show);
            d3.select(this).selectAll('circle').style('fill','#000');
            d3.select(this).selectAll('text').style('opacity',d.label?1:d.show);
        })

    var notebg=vnote
        .data(function(d) { return d; })
        .append('circle')
        .attr('cx',function(d){return d.cx})
        .attr('cy',function(d){return d.open?d.cy-10:d.cy})
        .attr('r',function(d){return d.r})
        .style('fill',function(d){return d.fill})
        .style('opacity',function(d){return d.label?0:d.show});

    var note=vnote
        .data(function(d) { return d; })
        .append('text')
        .attr('x',function(d){ return d.lx;})
        .attr('y',function(d){ return d.open?d.ly-10:d.ly;})
        .attr('font-family','sans-serif')
        .attr('font-size',function(d){return d.label?'18px':'14px'})
        .style('fill',function(d){return d.lfill})
        .style('opacity',function(d){return d.show})
        .text(function(d){return d.note;});

    var chordlabel=above
        .data(chord)
        .append('text')
        .attr('x',function(d){ return gx+124/2-10/2*chord.length;})
        .attr('y',function(d){ return 395+gy;})
        .attr('font-family','sans-serif')
        .attr('font-size','15px')
        .attr('fill','red')
        .text(chord);
}
