#language: pt

Feature: foo

Cenário: foo

  Variante: my foo
    Dado que eu vejo "x"
    Quando preencho {A}
      E eu preencho {B}
    Então vejo "y"
      E tenho ~foo state~

  Variante: my foo 2
    Dado que eu vejo "j"
    Quando preencho {A}
      E eu preencho {B}
    Então vejo "k"
      E tenho ~foo state~

Cenário: loo

  Variante: my loo
    Dado que eu vejo "x"
    Quando preencho {A}
    Então vejo "r"
      E tenho ~foo state~


Elemento de IU: A
  - tipo de dado é inteiro
  - valor mínimo é 5
    Caso contrário, eu devo ver "z"

Elemento de IU: B
  - tipo de dado é data
  - valor mínimo é "2010-01-01"
    Caso contrário, eu devo ver "w"