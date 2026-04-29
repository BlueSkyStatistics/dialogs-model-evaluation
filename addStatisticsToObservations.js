/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */






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

		BSkyAugmentModel <- function(model, full_data, stats_digits = BSkyGetDecimalDigitSetting(),
                              suffix = "_aaa", se_fit = TRUE,
                              keep_stats = c(".fitted", ".resid", ".se.fit",
                                             ".sigma", ".hat", ".cooksd", ".std.resid")) {

				keep_stats <- trimws(keep_stats)              # strip leading/trailing spaces
				keep_stats <- keep_stats[nchar(keep_stats) > 0]  # drop empty elements
  
			  # --- Steps 1-4 unchanged: extract vars, tag rows, clean, augment ---
			  model_vars <- tryCatch({
				all.vars(formula(model))
			  }, error = function(e) all.vars(as.formula(model$call$formula)))

			  valid_vars <- model_vars[model_vars %in% names(full_data)]

			  full_data$.original_row_id <- seq_len(nrow(full_data))

			  has_na     <- !all(complete.cases(full_data[, valid_vars]))
			  clean_data <- if (has_na) {
				full_data[complete.cases(full_data[, valid_vars]), ]
			  } else {
				full_data
			  }

			  bsky_augmented <- tryCatch({
				broom::augment(model, data = clean_data, se_fit = se_fit) %>%
				  dplyr::select(dplyr::any_of(c(
					".original_row_id",
					".fitted", ".resid", ".se.fit",
					".sigma", ".hat", ".cooksd", ".std.resid"
				  ))) %>%
				  # --- KEY: only keep stats the user requested ---
				  dplyr::select(".original_row_id",
								dplyr::any_of(keep_stats)) %>%
				  dplyr::mutate(across(-".original_row_id",
								~ round(.x, stats_digits)))
			  }, error = function(e) {
				warning("BSkyAugmentModel: augment failed — ", conditionMessage(e))
				return(NULL)
			  })

			  if (is.null(bsky_augmented)) {
				full_data$.original_row_id <- NULL
				return(full_data)
			  }

			  # --- Rename with suffix then join ---
			  stat_cols <- setdiff(names(bsky_augmented), ".original_row_id")
			  names(bsky_augmented)[names(bsky_augmented) %in% stat_cols] <-
				paste0(stat_cols, suffix)

			  bsky_result <- full_data %>%
				dplyr::left_join(bsky_augmented, by = ".original_row_id") %>%
				dplyr::select(-.original_row_id)

			  return(bsky_result)
		}
			
			
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
		#{{dataset.name}}<<-dplyr::bind_cols( {{dataset.name}}, round (broom::augment(model, data = {{dataset.name}}, se_fit =  {{if (options.selected.chk5 ==".se.fit,")}}TRUE{{#else}}FALSE{{/if}}) %>% dplyr::select ({{selected.chk1 | safe}}{{selected.chk2 | safe}}{{selected.chk3 | safe}}{{selected.chk4 | safe}}{{selected.chk5 | safe}}{{selected.chk6 | safe}}{{selected.chk7 | safe}}),BSkyGetDecimalDigitSetting())  %>% setNames(paste0(names(.), '_{{selected.suff | safe}}' ) ) ) 
		
		{{dataset.name}} <<- BSkyAugmentModel(
												  model       = model,
												  full_data   = {{dataset.name}},
												  stats_digits = BSkyGetDecimalDigitSetting(),
												  suffix      = '_{{selected.suff | safe}}',
												  se_fit      = TRUE,                          # always compute all stats
												  keep_stats  = strsplit(c("{{selected.chk1 | safe}}{{selected.chk2 | safe}}{{selected.chk3 | safe}}{{selected.chk4 | safe}}{{selected.chk5 | safe}}{{selected.chk6 | safe}}{{selected.chk7 | safe}}"), ",")[[1]]
												)
		
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
                onclick: `r_before_modal('${config.id}')`
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: addStatisticsToObservations.t('help.title'),
            r_help: addStatisticsToObservations.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: addStatisticsToObservations.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new addStatisticsToObservations().render()
}
