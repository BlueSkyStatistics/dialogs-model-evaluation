/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class modelLevelStatistics extends baseModal {
    static dialogId = 'modelLevelStatistics'
    static t = baseModal.makeT(modelLevelStatistics.dialogId)

    constructor() {
        var config = {
            id: modelLevelStatistics.dialogId,
            label: modelLevelStatistics.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode:`
require(broom)
require(equatiomatic)
require(rsm)

	bsky_model_response_var = NULL
	bsky_model_vars = NULL 
	
	bsky_model_response_var = all.vars(formula({{selected.modelselector1 | safe}}))[1]
	bsky_model_vars = all.vars(formula({{selected.modelselector1 | safe}}))[-1]
	cat("Selected model {{selected.modelselector1 | safe}} type: ", class({{selected.modelselector1 | safe}})[1], "\n")
	cat("Selected model response variable name: ", bsky_model_response_var, "\n")
	cat("Selected model variable name(s): ", paste(bsky_model_vars, collapse=','), "\n")
	
	#bsky_model_unique_terms <- unique(attr(terms({{selected.modelselector1 | safe}}), "term.labels"))
	#bsky_clean_model_formula <- reformulate(bsky_model_unique_terms, response = all.vars(formula({{selected.modelselector1 | safe}}))[1])

	BSkyFormat("Model formula")
	#print(bsky_clean_model_formula)
	print(({{selected.modelselector1 | safe}})$call)

	if(any(c("lm", "rsm", "glm") %in% class({{selected.modelselector1 | safe}})) && !any(c("manova", "maov", "aov") %in% class({{selected.modelselector1 | safe}}))) 
	{
		bsky_convert_lm_type = {{selected.modelselector1 | safe}}

		if(class({{selected.modelselector1 | safe}})[1] == 'rsm'){
			class(bsky_convert_lm_type) = "lm"
		}
			
		{{if (options.selected.showModelEquationChk === "TRUE")}}
		
			BSkyFormat("Model Equation with Coefficients")
			
			#Display theoretical model
			bsky_convert_lm_type %>%
				equatiomatic::extract_eq(raw_tex = FALSE,
					wrap = TRUE, intercept = "alpha", ital_vars = FALSE) %>%
					BSkyFormat()       

			#Display coefficients
			bsky_convert_lm_type %>%
				equatiomatic::extract_eq(use_coefs = TRUE,
				wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting()) %>%
				   BSkyFormat()
		{{/if}}
		
		if(class(bsky_convert_lm_type)[1] == "lm"){
			bsky_convert_lm_type %>% 
			  BSkyFormat(outputTableIndex = c(1),  perTableFooter = paste("Model Level Statistics for model {{selected.modelselector1 | safe}}"))
		}else{
			if(!any(c("manova", "maov") %in% class({{selected.modelselector1 | safe}}))){
				BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}%>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
			}else{
				BSkyFormat("Model Summary")
				summary({{selected.modelselector1 | safe}})
			}
		}
	
		rm(bsky_convert_lm_type)
	} else {
		if("train" %in% class({{selected.modelselector1 | safe}}) )
		{
			BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}$finalModel %>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
		} else {
			{{if (options.selected.showModelEquationChk === "TRUE")}}
				if(exists("call", where = ({{selected.modelselector1 | safe}}))){
					# Format the model formula
					cat(paste0("{{selected.modelselector1 | safe}}", " = ", paste(deparse({{selected.modelselector1 | safe}}\$call), collapse = "\n")), sep = "\n")
				}
			{{/if}}
			
			if(!any(c("manova", "maov") %in% class({{selected.modelselector1 | safe}}))){
				BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}%>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
			}else{
				BSkyFormat("Model Summary")
				summary({{selected.modelselector1 | safe}})
			}
		} 
	}
				   
`,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"loess\",\"lm\", \"glm\",\"multinom\",\"polr\",\"glmnet\",\"rlm\",\"rq\",\"lognet\",\"coxph\",\"lme\",\"survreg\",\"survfit\",\"flexsurvreg\",\"factanal\", \"lmerModLmerTest\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: modelLevelStatistics.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: modelLevelStatistics.t('label2'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: modelLevelStatistics.t('modelselector1'),
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
			showModelEquationChk: {
                el: new checkbox(config, {
                    label: modelLevelStatistics.t('showModelEquationChk'), 
					no: "showModelEquationChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
					//style: "ml-5",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state: "checked",
					newline: true,
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content,objects.showModelEquationChk.el.content],
            nav: {
                name: modelLevelStatistics.t('navigation'),
                icon: "icon-model_statistics",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: modelLevelStatistics.t('help.title'),
            r_help: modelLevelStatistics.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: modelLevelStatistics.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new modelLevelStatistics().render()
}
