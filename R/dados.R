library(tidyverse)

dados <- read_delim("data/quantidade_alunos_evadidos_x_curso2011_2025.csv", 
                    delim = ";", escape_double = FALSE, 
                    locale = locale(encoding = "ISO-8859-1"), 
                    trim_ws = TRUE, show_col_types = FALSE)
dados_etnia <- dados %>%
  pivot_longer(cols = starts_with("ET_"), 
               names_to = "ETNIA", 
               values_to = "Qtd_Evadidos") %>%
  filter(Qtd_Evadidos > 0)

dados_etnia$QTDE <- dados_etnia$Qtd_Evadidos

dados_etnia <- dados_etnia[,-12]

dados_etnia <- dados_etnia |>
  mutate(
    FORMA_EVASAO_limpa = case_when(
      # ---- Desligamentos ----
      grepl("Desligamento", FORMA_EVASAO, ignore.case = TRUE) ~ "Desligamento",
      grepl("Abandono", FORMA_EVASAO, ignore.case = TRUE) ~ "Desligamento",
      grepl("Nulidade", FORMA_EVASAO, ignore.case = TRUE) ~ "Desligamento",
      grepl("desativada", FORMA_EVASAO, ignore.case = TRUE) ~ "Desligamento",
      
      # ---- Desistências ----
      grepl("Desist", FORMA_EVASAO, ignore.case = TRUE) ~ "Desistência",
      grepl("Aband", FORMA_EVASAO, ignore.case = TRUE) ~ "Desistência",
      
      # ---- Transferências (exceto interna) ----
      grepl("SISU", FORMA_EVASAO, ignore.case = TRUE) ~ "Transferência",
      grepl("Transfer", FORMA_EVASAO, ignore.case = TRUE) & 
        !grepl("Interna", FORMA_EVASAO, ignore.case = TRUE) ~ "Transferência",
      
      # ---- Transferência interna ----
      grepl("Reopção", FORMA_EVASAO, ignore.case = TRUE) ~ "Transferência Interna",
      grepl("Interna", FORMA_EVASAO, ignore.case = TRUE) ~ "Transferência Interna",
      
      # ---- Formado ----
      grepl("Formado", FORMA_EVASAO, ignore.case = TRUE) ~ "Formado",
      grepl("Conclusão", FORMA_EVASAO, ignore.case = TRUE) ~ "Formado",
      
      grepl("Adaptação Curricular", FORMA_EVASAO, ignore.case = TRUE) ~ "Adaptação Curricular",
      
      # ---- Não informado ----
      grepl("Não Informado", FORMA_EVASAO, ignore.case = TRUE) ~ "Não Informado",
      
      # ---- Outras situações ----
      TRUE ~ "Outros"
    ),
    CURSO = case_when(
      grepl("Física", NOME_CURSO, ignore.case = TRUE) ~ "Física",
      grepl("Química", NOME_CURSO, ignore.case = TRUE) ~ "Química",
      grepl("Matemática", NOME_CURSO, ignore.case = TRUE) ~ "Matemática",
      grepl("Estatística", NOME_CURSO, ignore.case = TRUE) ~ "Estatística",
      
      TRUE ~ "ERRADO!!!"
    ),
    MODALIDADE = case_when(
      grepl("Programas", AREA_CONHECIMENTO, ignore.case = TRUE) ~ "Programas Básicos",
      grepl("Ciências", AREA_CONHECIMENTO, ignore.case = TRUE) ~ "Bacharelado",
      grepl("Educação", AREA_CONHECIMENTO, ignore.case = TRUE) ~ "Licenciatura",
      
      TRUE ~ "ERRADO!!!"
    )
  )
dados_etnia <- dados_etnia |> 
  mutate(
    QTDE_FORMADO = if_else(FORMA_EVASAO_limpa == "Formado", QTDE, 0),
    QTDE = if_else(FORMA_EVASAO_limpa == "Formado", 0, QTDE)
  )

dados_etnia$ETNIA <- gsub("^ET_", "", dados_etnia$ETNIA)

dados_etnia$ETNIA <- gsub("_", " ", dados_etnia$ETNIA)

dados <- dados_etnia

write.csv(dados, file = "data/evasao.csv")