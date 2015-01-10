/*
* Implements grammar for PEG parser for Run Length Encoded format
* Life files (RLE) which are used for storing large Life patterns.
* RLE files are saved with a .rle file extension.
*
* Reference on file format can be found
* on LifeWiki: http://conwaylife.com/wiki/Run_Length_Encoded
* This implementation is created keeping in mind life.js's needs and
* does not pretend to be most effective, most universal or else.
*/
start
 = line+

line
 = line:(meta_tags / header / pattern_lines) nl? { return line }

/*
* RLE encoded pattern section
*/
pattern_lines
 = pattern_lines:pattern_line+ {
    return {
        "type": "lines",
        "items": pattern_lines
    }
}

pattern_line
 = tag:pattern_single_tag* __ (pattern_tag_eol / pattern_eof) __ {
    return tag
}

pattern_single_tag
 = normal_or_countless_tag / tagless_dead_tag

pattern_tag_eol
 = "$"

pattern_eof
 = "!" .* // we ignore anything after "!" sign

normal_or_countless_tag
 = run_count:int? __ tag:tag __ {
   return [run_count || 1, tag]
}

tagless_dead_tag
 = run_count:int {
   return [run_count, "b"];
}



tag "cell tag"
 // b = a dead cell
 // o = a live cell
 = [bo]

/*
* Header meta comments section
*/
header "header line"
 = "x" _ equals _ x:int _ comma _ "y" _ equals _ y:int _ rule:header_rule? {
    return {
        "type": "header",
        "x": x,
        "y": y,
        "rule": rule
    }
}

header_rule
 = _ comma _ "rule" _ equals _ rule:str _ {
    return rule;
}

meta_tags "comment line (#)"
 = meta_name / meta_comment / meta_rules / meta_author / meta_top_left_coordinates

meta_name "name comment (#N)"
 = "#N" _ data:str {
    return {
        "type": "name",
        "value": data
    }
}

meta_comment "comment (#C, #c)"
 = "#"[Cc] _ data:str? {
    return {
        "type": "comment",
        "value": data || ""
    }
}

meta_rules "rules comment (#r)"
 = "#r" _ data:str {
    return {
        "type": "rules",
        "value": data
    }
}

meta_author "author comment (#O)"
 = "#O" _ data:str {
    return {
        "type": "author",
        "value": data
    }
}

meta_top_left_coordinates "TL coordinates comment (#R, #P)"
 = "#"[RP] _ x:signed_int _ y:signed_int  {
    return {
        "type": "topLeftCoordinates",
        "x": x,
        "y": y,
    }
}


/*
* Basic types
*/
str "comment string"
 = characters:([^\n])+ {
    return characters.join("");
}

int "integer"
 = digits:digit+ {
    return parseInt(digits.join(""));
}

signed_int "signed integer"
 = sign:[+-]? n:int {
    return parseInt(
        sign + n
    )
}

comma
 = ","

equals
 = "="

digit
 = [0-9]

/*
* Various
*/
nl "new line"
 = "\n"

ws "white space"
 = [ \t]

_ "any number of whitespaces"
 = ws*

__ "extended whitespace"
 = nl* / ws*
