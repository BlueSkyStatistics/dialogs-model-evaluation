








class addStatisticsToObservations extends baseModal {
    static dialogId = 'addStatisticsToObservations'
    static t = baseModal.makeT(addStatisticsToObservations.dialogId)

    constructor() {
        var config = {
            id: addStatisticsToObservations.dialogId,
            label: addStatisticsToObservations.t('title'),
            modalType: "one",
            splitProcessing:false,
            RCode: `
require(broom)
require(dplyr)
local({
results <-ModelMatchesDataset('{{selected.modelselector1 | safe}}', '{{dataset.name}}', NAinVarsCheck=FALSE ) 
if ( results$success ==TRUE)
{
    if ( "train" %in% class({{selected.modelselector1 | safe}}) )
    {
    model ={{selected.modelselector1 | safe}}$finalModel
    }
    else
    {
    model ={{selected.modelselector1 | safe}}
    }
    #Robust linear regression returns a model of class lm and rlm
    if ( ("lm" %in% class(model)  || "glm" %in% class(model)) && !"rlm" %in% class(model)   )
    {
    {{dataset.name}}<<-dplyr::bind_cols( {{dataset.name}}, round (broom::augment(model, data = {{dataset.name}}, se_fit =  {{if (options.selected.chk5 ==".se.fit,")}}TRUE{{#else}}FALSE{{/if}}) %>% dplyr::select ({{selected.chk1 | safe}}{{selected.chk2 | safe}}{{selected.chk3 | safe}}{{selected.chk4 | safe}}{{selected.chk5 | safe}}{{selected.chk6 | safe}}{{selected.chk7 | safe}}),BSkyGetDecimalDigitSetting())  %>% setNames(paste0(names(.), '_{{selected.suff | safe}}' ) ) ) 
    }
    else if ( "rq" %in% class(model) )
    {
    {{dataset.name}}<<-dplyr::bind_cols( {{dataset.name}}, round( broom::augment(model, data = {{dataset.name}}) %>% dplyr::select ({{selected.chk4 | safe}}{{selected.chk6 | safe}}{{selected.chk8 | safe}}),BSkyGetDecimalDigitSetting() ) %>% setNames(paste0(names(.), '_{{selected.suff | safe}}') ) ) 
    }
    else
    {
    {{dataset.name}}<<-dplyr:: bind_cols( {{dataset.name}}, round(broom::augment(model, data = {{dataset.name}}) %>% dplyr::select ({{selected.chk4 | safe}}{{selected.chk5 | safe}}{{selected.chk6 | safe}}), BSkyGetDecimalDigitSetting()) %>% setNames(paste0(names(.), '_{{selected.suff | safe}}' ) ) ) 
    }
}
})
BSkyLoadRefresh("{{dataset.name}}")
            `,
            pre_start_r: JSON.stringify({
                modelselector1: "BSkyGetAvailableModels(c(\"lm\", \"glm\",\"rlm\",\"rq\",\"coxph\",\"loess\",\"survreg\"))",
            })
        }
        var objects = {
            label1: { el: new labelVar(config, { label: addStatisticsToObservations.t('label1'), h: 9 }) },
            label2: { el: new labelVar(config, { label: addStatisticsToObservations.t('label2'), h: 9 }) },
            modelselector1: {
                el: new comboBox(config, {
                    no: 'modelselector1',
                    label: addStatisticsToObservations.t('modelselector1'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    required: true,
                    options: [],
                    default: ""
                })
            },
            suff: {
                el: new input(config, {
                    no: 'suff',
                    label: addStatisticsToObservations.t('suff'),
                    placeholder: "",
                    style: "mb-4",
                    extraction: "TextAsIs",
                    required: true,
                    type: "character",
                    value: ""
                })
            },
            label3: { el: new labelVar(config, { label: addStatisticsToObservations.t('label3'), h: 9 }) },
            label4: { el: new labelVar(config, { label: addStatisticsToObservations.t('label4'), h: 7 }) },
            chk1: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk1'),
                    no: "chk1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".hat,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk2: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk2'),
                    no: "chk2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".sigma,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk3: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk3'),
                    no: "chk3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".cooksd,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk4: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk4'),
                    no: "chk4",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".fitted,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk5: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk5'),
                    no: "chk5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".se.fit,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk6: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk6'),
                    no: "chk6",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".resid,",
                    false_value: " ",
                    newline: true,
                })
            },
            chk7: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk7'),
                    no: "chk7",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".std.resid",
                    false_value: " ",
                    newline: true,
                })
            },
            chk8: {
                el: new checkbox(config, {
                    label: addStatisticsToObservations.t('chk8'),
                    no: "chk8",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: ".tau",
                    false_value: " ",
                    newline: true,
                })
            },
        }
        const content = {
            items: [objects.label1.el.content, objects.label2.el.content, objects.modelselector1.el.content, objects.suff.el.content, objects.label3.el.content, objects.label4.el.content, objects.chk1.el.content, objects.chk2.el.content, objects.chk3.el.content, objects.chk4.el.content, objects.chk5.el.content, objects.chk6.el.content, objects.chk7.el.content, objects.chk8.el.content],
            nav: {
                name: addStatisticsToObservations.t('navigation'),
                icon: "icon-add_stats_to_obs",
                onclick: `r_before_modal("${config.id}")`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: addStatisticsToObservations.t('help.title'),
            r_help: addStatisticsToObservations.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: addStatisticsToObservations.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new addStatisticsToObservations().render()
}
