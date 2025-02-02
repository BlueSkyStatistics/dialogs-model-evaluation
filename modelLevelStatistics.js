








class modelLevelStatistics extends baseModal {
    static dialogId = 'modelLevelStatistics'
    static t = baseModal.makeT(modelLevelStatistics.dialogId)

    constructor() {
        var config = {
            id: modelLevelStatistics.dialogId,
            label: modelLevelStatistics.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
require(broom)
require(equatiomatic)



	if(any(c("lm","glm") %in% class({{selected.modelselector1 | safe}})[1]))
	{
		{{if (options.selected.showModelEquationChk === "TRUE")}}
			#Display theoretical model
			{{selected.modelselector1 | safe}} %>%
				equatiomatic::extract_eq(raw_tex = FALSE,
					wrap = TRUE, intercept = "alpha", ital_vars = FALSE) %>%
					BSkyFormat()       

			#Display coefficients
			{{selected.modelselector1 | safe}} %>%
				equatiomatic::extract_eq(use_coefs = TRUE,
				wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting()) %>%
				   BSkyFormat()
		{{/if}}
		{{selected.modelselector1 | safe}} %>% 
			  BSkyFormat(outputTableIndex = c(1),  perTableFooter = paste("Model Level Statistics for model {{selected.modelselector1 | safe}}"))
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
			BSkyFormat(as.data.frame({{selected.modelselector1 | safe}}%>% glance() ),singleTableOutputHeader = "Model Level Statistics for model {{selected.modelselector1 | safe}}" )
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
            r_help: modelLevelStatistics.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: modelLevelStatistics.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new modelLevelStatistics().render()
}
