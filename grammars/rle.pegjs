start
 = call+

call
 = line:(meta_tags / header / pattern_tags) nl? { return line }

/*
* RLE encoded pattern section
*/
pattern_tags
 = tag:pattern_single_tag+ _ (pattern_tag_eol / pattern_eof) __ { return tag }

pattern_tag_eol
 = "$"

pattern_eof
 = "!" .* // we ignore anything after "!" sign

pattern_single_tag
 = run_count:int? _ tag:tag _ { 
  return {
    "run_count": run_count || 1,
    "tag": tag
  } 
}

tag "cell tag"
 = [bo]


/*
* Header meta comments section
*/
header "header line"
 = "x" _ equals _ x:int _ comma _ "y" _ equals _ y:int rule:(_ comma _ rule:header_rule {return rule })? {
  return {
    "type": "header",
    "x": x,
    "y": y,
    "rule": rule
  }
}

header_rule
 = "rule" _ equals _ rule:str {
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
 = "#"[Cc] _ data:str {
  return {
    "type": "comment",
    "value": data
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
str "string" 
 = characters:([^\n])+ {
  return characters.join("");
}

int "integer"
 = digits:digit+ {
   return parseInt(digits.join(""));
}

signed_int "signed integer"
 = sign:[+-]* digits:digit+ {
   return parseInt(
     sign + digits.join("")
   );
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
 = ws* / nl*