/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */










class summarizeNModels extends baseModal {
    static dialogId = 'summarizeNModels'
    static t = baseModal.makeT(summarizeNModels.dialogId)

    constructor() {
        var config = {
            id: summarizeNModels.dialogId,
            label: summarizeNModels.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
library(texreg)
#NOTE: zeroinfl/hurdle models (pscl package) display as two coefficient blocks per model
#("Count model: " and "Zero model: " prefixes) since they have two linear predictors, unlike a
#single-part glm/negbin model. When comparing a single-part count model (glm/negbin) alongside a
#zeroinfl/hurdle model, we relabel the single-part model's rows with the same "Count model: " prefix
#so texreg aligns them on the same row instead of listing them as unrelated terms. We also pass the
#actual model variable names as column headers instead of texreg's default "Model 1"/"Model 2"/etc.
tryCatch(
{
    BSky_Compare_ModelExpr = quote(list({{selected.modelselector1 | safe}}))
    BSky_Compare_Names = sapply(as.list(BSky_Compare_ModelExpr)[-1], deparse)
    BSky_Compare_Models = list({{selected.modelselector1 | safe}})
    BSky_Compare_HasMixture = any(sapply(BSky_Compare_Models, function(m) inherits(m, "zeroinfl") || inherits(m, "hurdle")))

    BSky_Compare_Extracted = lapply(BSky_Compare_Models, function(m)
    {
        tryCatch(
        {
            BSky_ExtractedModel = texreg::extract(m)
            if (BSky_Compare_HasMixture && !(inherits(m, "zeroinfl") || inherits(m, "hurdle")))
            {
                BSky_ExtractedModel@coef.names = paste0("Count model: ", BSky_ExtractedModel@coef.names)
            }
            BSky_ExtractedModel
        }, error = function(e) { m })
    })

    hout = texreg::htmlreg(BSky_Compare_Extracted, digits = BSkyGetDecimalDigitSetting(), \n\tcenter = FALSE, caption = "Statistical Model Comparison", caption.above = TRUE, custom.model.names = BSky_Compare_Names)
    BSkyFormat(hout)

    if (exists("BSky_Compare_ModelExpr")) rm(BSky_Compare_ModelExpr, BSky_Compare_Names, BSky_Compare_Models, BSky_Compare_HasMixture, BSky_Compare_Extracted)
}, error = function(e) { cat("Note: Could not build the side-by-side coefficient comparison table:", conditionMessage(e), "\\n") })
local(
{
    #A standalone fit-statistics table computed the same way for every selected model, independent of
    #whatever texreg's internal extract() methods do or do not report per model class (texreg's own
    #BIC/Deviance reporting is inconsistent across classes like zeroinfl/hurdle, so we do not rely on it
    #here). BIC is computed manually from logLik() + sample size rather than via the generic stats::BIC(),
    #since that generic requires an nobs() method that not every model class registers. Deviance is left
    #as NA for model classes (e.g. zeroinfl/hurdle) that do not define a deviance() method - there is no
    #standard saturated-model deviance decomposition for a mixture-likelihood model.
    require(pscl)
    BSky_GOF_ModelExpr = quote(list({{selected.modelselector1 | safe}}))
    BSky_GOF_Names = sapply(as.list(BSky_GOF_ModelExpr)[-1], deparse)
    BSky_GOF_Models = list({{selected.modelselector1 | safe}})
    BSky_GOF_Results = data.frame(Model = character(), AIC = numeric(), BIC = numeric(), LogLikelihood = numeric(), Deviance = numeric(), Num_obs = numeric(), stringsAsFactors = FALSE)

    #Some generics (e.g. stats::deviance() on a zeroinfl/hurdle object) complete without error but return
    #NULL rather than a value. NULL/zero-length results are coerced to NA here, or data.frame() fails with
    #"differing number of rows" when a column silently has length 0 instead of length 1.
    BSky_SafeVal = function(x) { if (is.null(x) || length(x) != 1 || is.na(x)) NA else x }

    for (BSky_GOF_i in seq_along(BSky_GOF_Models))
    {
        BSky_GOF_m = BSky_GOF_Models[[BSky_GOF_i]]
        BSky_GOF_Nm = BSky_GOF_Names[BSky_GOF_i]
        BSky_GOF_AIC = NA
        BSky_GOF_LLVal = NA
        BSky_GOF_K = NA
        BSky_GOF_N = NA
        BSky_GOF_BIC = NA
        BSky_GOF_Dev = NA

        tryCatch({ BSky_GOF_AIC = BSky_SafeVal(stats::AIC(BSky_GOF_m)) }, error = function(e) { })

        tryCatch(
        {
            BSky_GOF_LL = stats::logLik(BSky_GOF_m)
            BSky_GOF_LLVal = BSky_SafeVal(as.numeric(BSky_GOF_LL))
            BSky_GOF_K = BSky_SafeVal(attr(BSky_GOF_LL, "df"))
        }, error = function(e) { })

        tryCatch({ BSky_GOF_N = BSky_SafeVal(length(BSky_GOF_m\$y)) }, error = function(e) { })
        if (is.na(BSky_GOF_N))
        {
            tryCatch({ BSky_GOF_N = BSky_SafeVal(stats::nobs(BSky_GOF_m)) }, error = function(e) { })
        }

        if (!is.na(BSky_GOF_LLVal) && !is.na(BSky_GOF_N) && !is.na(BSky_GOF_K))
        {
            tryCatch({ BSky_GOF_BIC = BSky_SafeVal(-2 * BSky_GOF_LLVal + BSky_GOF_K * log(BSky_GOF_N)) }, error = function(e) { })
        }

        tryCatch({ BSky_GOF_Dev = BSky_SafeVal(stats::deviance(BSky_GOF_m)) }, error = function(e) { })

        BSky_GOF_Results = rbind(BSky_GOF_Results, data.frame(Model = BSky_GOF_Nm, AIC = BSky_GOF_AIC, BIC = BSky_GOF_BIC, LogLikelihood = BSky_GOF_LLVal, Deviance = BSky_GOF_Dev, Num_obs = BSky_GOF_N))
    }

    BSkyFormat(BSky_GOF_Results, singleTableOutputHeader = "Model Fit Statistics")

    if (exists("BSky_GOF_ModelExpr")) rm(BSky_GOF_ModelExpr, BSky_GOF_Names, BSky_GOF_Models, BSky_GOF_Results)
}
)
{{if (options.selected.zeroCheck == "TRUE")}}
local(
{
    #Poisson (family(model)$family == "poisson"), Negative Binomial (class "negbin", from MASS::glm.nb),
    #Zero-Inflated (class "zeroinfl") and Hurdle (class "hurdle") models (both from package pscl) all have
    #a well-defined zero-count probability that can be checked against the observed zero rate.
    #Every other selected model class (lm, coxph, gls, polr, multinom, loess, etc.) is silently skipped.
    BSky_ZeroCheck_ModelExpr = quote(list({{selected.modelselector1 | safe}}))
    BSky_ZeroCheck_ModelNames = sapply(as.list(BSky_ZeroCheck_ModelExpr)[-1], deparse)
    BSky_ZeroCheck_Models = list({{selected.modelselector1 | safe}})
    BSky_ZeroCheck_Results = data.frame(Model = character(), ModelClass = character(), Observed_Zero_Rate = numeric(), Predicted_Zero_Rate = numeric(), stringsAsFactors = FALSE)

    for (BSky_ZeroCheck_i in seq_along(BSky_ZeroCheck_Models))
    {
        BSky_ZeroCheck_m = BSky_ZeroCheck_Models[[BSky_ZeroCheck_i]]
        BSky_ZeroCheck_Name = BSky_ZeroCheck_ModelNames[BSky_ZeroCheck_i]
        BSky_ZeroCheck_PredRate = NA
        BSky_ZeroCheck_IsCount = FALSE
        BSky_ZeroCheck_Class = NA

        tryCatch(
        {
            if (inherits(BSky_ZeroCheck_m, "negbin"))
            {
                BSky_ZeroCheck_PredRate = mean(dnbinom(0, size = BSky_ZeroCheck_m\$theta, mu = fitted(BSky_ZeroCheck_m)))
                BSky_ZeroCheck_IsCount = TRUE
                BSky_ZeroCheck_Class = "Negative Binomial (glm.nb)"
            }
            else if (inherits(BSky_ZeroCheck_m, "glm") && family(BSky_ZeroCheck_m)\$family == "poisson")
            {
                BSky_ZeroCheck_PredRate = mean(dpois(0, fitted(BSky_ZeroCheck_m)))
                BSky_ZeroCheck_IsCount = TRUE
                BSky_ZeroCheck_Class = "Poisson (glm)"
            }
            else if (inherits(BSky_ZeroCheck_m, "zeroinfl"))
            {
                BSky_ZeroCheck_PredRate = mean(predict(BSky_ZeroCheck_m, type = "prob")[, 1])
                BSky_ZeroCheck_IsCount = TRUE
                BSky_ZeroCheck_Class = paste0("Zero-Inflated (", BSky_ZeroCheck_m\$dist, ")")
            }
            else if (inherits(BSky_ZeroCheck_m, "hurdle"))
            {
                BSky_ZeroCheck_PredRate = mean(predict(BSky_ZeroCheck_m, type = "prob")[, 1])
                BSky_ZeroCheck_IsCount = TRUE
                BSky_ZeroCheck_Class = paste0("Hurdle (", BSky_ZeroCheck_m\$dist, ")")
            }
        }, error = function(e) { })

        if (BSky_ZeroCheck_IsCount)
        {
            #Prefer the model's stored response vector (glm, negbin, zeroinfl, and hurdle objects all
            #store $y by default); fall back to model.frame() if that is unavailable for any reason.
            BSky_ZeroCheck_RespVals = BSky_ZeroCheck_m\$y
            if (is.null(BSky_ZeroCheck_RespVals))
            {
                BSky_ZeroCheck_RespVals = tryCatch(model.response(model.frame(BSky_ZeroCheck_m)), error = function(e) NULL)
            }
            if (!is.null(BSky_ZeroCheck_RespVals))
            {
                BSky_ZeroCheck_ObsRate = mean(BSky_ZeroCheck_RespVals == 0, na.rm = TRUE)
                BSky_ZeroCheck_Results = rbind(BSky_ZeroCheck_Results, data.frame(Model = BSky_ZeroCheck_Name, ModelClass = BSky_ZeroCheck_Class, Observed_Zero_Rate = BSky_ZeroCheck_ObsRate, Predicted_Zero_Rate = BSky_ZeroCheck_PredRate))
            }
        }
    }

    if (nrow(BSky_ZeroCheck_Results) > 0)
    {
        BSkyFormat(BSky_ZeroCheck_Results, singleTableOutputHeader = "Observed vs Predicted Zero Rate (Poisson / Negative Binomial / Zero-Inflated / Hurdle models only)")
    }
    else
    {
        cat("None of the selected models are Poisson, Negative Binomial, Zero-Inflated, or Hurdle count models, so a zero-rate comparison is not applicable.\\n")
    }

    if (exists("BSky_ZeroCheck_ModelExpr")) rm(BSky_ZeroCheck_ModelExpr, BSky_ZeroCheck_ModelNames, BSky_ZeroCheck_Models, BSky_ZeroCheck_Results)
}
)
{{/if}}
{{if (options.selected.vuongCheck == "TRUE")}}
local(
{
    #Vuong test (pscl::vuong) compares two count models on a per-observation likelihood basis - it is the
    #standard way to formally compare a Zero-Inflated or Hurdle model against its non-inflated counterpart
    #(e.g. Negative Binomial), since the two are not cleanly nested (the inflation probability sits on a
    #parameter-space boundary at zero), which makes a plain likelihood-ratio test unreliable here.
    require(pscl)
    BSky_Vuong_ModelExpr = quote(list({{selected.modelselector1 | safe}}))
    BSky_Vuong_Names = sapply(as.list(BSky_Vuong_ModelExpr)[-1], deparse)
    BSky_Vuong_Models = list({{selected.modelselector1 | safe}})

    if (length(BSky_Vuong_Models) != 2)
    {
        cat("Note: The Vuong test compares exactly two count models. Please select exactly 2 models (e.g. a Negative Binomial model and a Zero-Inflated/Hurdle model) to run this test.\\n")
    }
    else
    {
        BSky_Vuong_ValidClasses = c("glm", "negbin", "zeroinfl", "hurdle")
        BSky_Vuong_Class1Ok = any(sapply(BSky_Vuong_ValidClasses, function(cl) inherits(BSky_Vuong_Models[[1]], cl)))
        BSky_Vuong_Class2Ok = any(sapply(BSky_Vuong_ValidClasses, function(cl) inherits(BSky_Vuong_Models[[2]], cl)))

        if (!BSky_Vuong_Class1Ok || !BSky_Vuong_Class2Ok)
        {
            cat("Note: The Vuong test requires both selected models to be count models (Poisson/Negative Binomial glm, or Zero-Inflated/Hurdle from package pscl). One or both selected models do not meet this requirement.\\n")
        }
        else
        {
            tryCatch(
            {
                cat(paste0("Vuong Test: ", BSky_Vuong_Names[1], " vs. ", BSky_Vuong_Names[2], "\\n"))
                cat(paste(utils::capture.output(pscl::vuong(BSky_Vuong_Models[[1]], BSky_Vuong_Models[[2]])), collapse = "\\n"))
                cat("\\n")
            }, error = function(e) { cat("Note: Could not run the Vuong test:", conditionMessage(e), "\\n") })
        }
    }

    if (exists("BSky_Vuong_ModelExpr")) rm(BSky_Vuong_ModelExpr, BSky_Vuong_Names, BSky_Vuong_Models)
}
)
{{/if}}
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"coxph\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\",\"zeroinfl\",\"hurdle\"), returnClassTrain=FALSE)",
                
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: summarizeNModels.t('label1'), h: 6 }) },
            label2: { el: new labelVar(config, { label: summarizeNModels.t('label2'), h: 6 }) },
            label3: { el: new labelVar(config, { label: summarizeNModels.t('label3'), h: 6 }) },
            label4: { el: new labelVar(config, { label: summarizeNModels.t('label4'), h: 6 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: summarizeNModels.t('modelselector1'),
                    multiple: true,
                    required: true,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            },
            zeroCheck: {
                el: new checkbox(config, {
                    label: summarizeNModels.t('zeroCheck'),
                    no: "zeroCheck",
                    style: "mt-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            vuongCheck: {
                el: new checkbox(config, {
                    label: summarizeNModels.t('vuongCheck'),
                    no: "vuongCheck",
                    style: "mt-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.label3.el.content, objects.label4.el.content, objects.modelselector1.el.content, objects.zeroCheck.el.content, objects.vuongCheck.el.content],
            nav: {
                name: summarizeNModels.t('navigation'),
                icon: "icon-sigma-n",
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: summarizeNModels.t('help.title'),
            r_help: summarizeNModels.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: summarizeNModels.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new summarizeNModels().render()
}
