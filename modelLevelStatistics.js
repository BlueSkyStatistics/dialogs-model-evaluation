
var localization = {
    en: {
        title: "Model Level Statistics",
        navigation: "Model Statistics",
        label1: "Models of the following classes are supported, classes are listed in parenthesis below",
        label2: "Linear models (lm), Generalized linear models (glm), Multinomial log-linear (multinom), Quantile regression (rq), Robust linear regression (rlm), Survival curve object (survfit), Linear mixed effects model (lme), Proportional hazards regression object (coxph), Parametric survival regression model (survreg), Ordered logistic/Probit regression (polr), Factor analysis (factanal), Lasso and Elastic-net regularized generalized linear models (glmnet)",
        modelselector1: "Select a model",
		showModelEquationChk: "Show model equation (only for lm,glm, quadratic,cubic models)",
        help: {
            title: "Model Level Statistics",
            r_help: "help(glance, package ='broom')",
            body: `
                <b>Description</b></br>
Construct a single row summary "glance" of a model, fit, or other object
<br/>
<b>Usage</b>
<br/>
<code> 
glance(x, ...)
</code> <br/>
<b>Arguments</b><br/>
<ul>
<li>
x: model or other R object summarize
</li>
</ul>
<b>Details</b></br>
glance methods always return either a one-row data frame with values, see Values below (except on NULL, which returns an empty data frame)</br>
Summarizes the following models</br>
Linear models (model class lm)</br>
Generalized linear models (model class glm)</br>
Multinomial Log-Linear Models (model class multinom)</br>
Ordered logistic or Probit Regression (model class polr)</br>
Lasso and Elastic-Net Regularized Generalized Linear Models (model class glmnet)</br>
Robust linear regression (model class rlm)</br>
Quantile Regression (model class rq)</br>
linear mixed effects model (lme)</br>
Proportional hazards regression object (coxph)</br>
Parametric survival regression model (survreg)</br>
Factor analysis (factanal)</br>
<b>Value</b><br/>
A one-row tibble::tibble with columns:<br/>
r.squared: The percent of variance explained by the model<br/>
adj.r.squared: r.squared adjusted based on the degrees of freedom<br/>
sigma: The square root of the estimated residual variance<br/>
statistic: F-statistic<br/>
p.value: p-value from the F test, describing whether the full regression is significant<br/>
df: Degrees of freedom used by the coefficients<br/>
logLik: the data's log-likelihood under the model<br/>
AIC: the Akaike Information Criterion<br/>
BIC: the Bayesian Information Criterion<br/>
deviance: deviance<br/>
df.residual: residual degrees of freedom<br/>
<b>Package</b></br>
broom</br>
<b>Help</b></br>
For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command in the R syntax editor help(glance, package ='broom')
                `}
    }
}







class modelLevelStatistics extends baseModal {
    constructor() {
        var config = {
            id: "modelLevelStatistics",
            label: localization.en.title,
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
            label1: { el: new labelVar(config, { label: localization.en.label1, h: 6 }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: localization.en.modelselector1,
                    multiple: false,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
			showModelEquationChk: {
                el: new checkbox(config, {
                    label: localization.en.showModelEquationChk, 
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
                name: localization.en.navigation,
                icon: "icon-model_statistics",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new modelLevelStatistics().render()