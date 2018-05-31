# Ações

> Exemplos de sentenças de Variantes com ações

*Um exemplo pode demonstrar diferentes variações da mesma ação.*

## `amOn`

```gherkin
Dado que estou em "http://concordialang.org"
```

## `append`

```gherkin
Quando eu adiciono "Bar" em {Foo}
  e adiciono 100 em {Bar}
  e adiciono "Bar" em <#zoo>
  e adiciono 100 em <#xoo>
```

## `attachFile`

```gherkin
Quando eu anexo o arquivo "/path/to/file" em {Foo}
  e anexo "/path/to/file" em <#bar>
```

## `check`

```gherkin
Quando eu marco {Foo}
  e marco <#bar>
```

## `clear`

```gherkin
Quando eu apago o cookie "foo"
  e quando eu limpo o cookie "bar"
```
```gherkin
Quando eu limpo {Foo}
  e limpo <#bar>
```

## `click`

```gherkin
Quando eu clico em {Foo}
  e clico em <#bar>
```

## `close`

```gherkin
Quando eu fecho a aba atual
```
```gherkin
Quando eu fecho as outras abas
```
Somente Appium:
```gherkin
Quando eu fecho o app
  e quando eu fecho a aplicação
```

## `doubleClick`

```gherkin
Quando eu clico duas vezes em {Foo}
  e dou um duplo clique em <#bar>
```

## `drag`

```gherkin
Quando eu arrasto {Foo} para <#bar>
```

## `fill`

```gherkin
Quando eu preecho {Foo}
  e eu informo {Foo}
  e eu entro com {Foo}
  e eu preencho {Foo} com "foo"
  e eu preencho {Foo} com 100
  e eu preencho <#bar> com "bar"
  e eu precho <#bar> com 3.1415
  e eu digito "bar" em {Foo}
  e eu informo "foo" em <#bar>
```

## `hide`

Somente Appium:
```gherkin
Quando I oculto o teclado
```

## `install`

Somente Appium:
```gherkin
Quando eu instalo o app "com.example.android.myapp"
  e quando eu instalo a aplicação "com.example.android.myapp"
```

## `open`

Somente Appium:
```gherkin
Quando eu abro o painel de notificações
```

## `press`

```gherkin
Quando eu pressiono "Enter"
  e pressiono "Ctrl", "Alt", "Del"
```

## `pull`

Somente Appium:
```gherkin
Quando eu extraio "/storage/emulated/0/DCIM/logo.png" para "some/path"
```

## `rightClick`

```gherkin
Quando eu clico com o botão direito em {Foo}
  e clico com o botão direito em <#bar>
```

## `saveScreenshot`

```gherkin
Quando salvo uma foto pra "foo.png"
  e eu bato uma foto da tela para "bar.png"
```

## `see`

```gherkin
Então eu não vejo "Foo Bar"
```

```gherkin
Então eu não vejo {Foo} is checked
```


Somente Appium:
```gherkin
Então eu vejo que o app "com.example.android.myapp" está instalado
```

Somente Appium:
```gherkin
Então eu vejo que o app "com.example.android.myapp" não está instalado
```

Somente Appium:
```gherkin
Então eu vejo que a atividade atual é ".HomeScreenActivity"
```

Somente Appium:
```gherkin
Então eu vejo que o dispositivo está bloqueado
```

Somente Appium:
```gherkin
Então eu vejo que o dispositivo está desbloqueado
```

```gherkin
Então eu não vejo o cookie "foo"
```

Somente Appium:
```gherkin
Então eu vejo que a orientação é paisagem
```

Somente Appium:
```gherkin
Então eu vejo que a orientação é retrato
```

```gherkin
Então eu não vejo a url "/foo"
```

```gherkin
Então eu não vejo {Foo} com "foo"
  e eu não vejo <#bar> com "bar"
```

```gherkin
Então eu não vejo a "foo" no título
```

```gherkin
Então eu não vejo {Foo}
  e eu não vejo <#bar>
```

```gherkin
Então eu vejo "Foo Bar"
```

```gherkin
Então eu vejo que {Foo} está marcado
```

```gherkin
Então eu vejo o cookie "foo"
```

```gherkin
Então eu vejo a url "/foo"
```

```gherkin
Então eu vejo {Foo} com "foo"
  e eu vejo <#bar> com "bar"
```

```gherkin
Então eu vejo a "foo" no título
```

```gherkin
Então eu vejo {Foo}
  e eu vejo <#bar>
```

## `select`

```gherkin
Então eu seleciono "foo" em {Foo}
  e seleciono "bar" em <#bar>
```

## `shake`

Somente Appium:
```gherkin
Quando eu balanço o dispositivo
  e eu tremo o celular
  e eu sacudo o tablet
```

## `swipe`

Somente Appium:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para 100, 200
```

Somente Appium:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para baixo
```
Somente Appium:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para a esquerda
```

Somente Appium:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para direita
```

Somente Appium:
```gherkin
Quando eu deslizo "#io.selendroid.myapp:id/LinearLayout1" para cima
```

## `switch`

Somente Appium:
```gherkin
Quando eu troco para nativo
```

Somente Appium:
```gherkin
Quando eu troco para web
```

## `tap`

Somente Appium:
```gherkin
Quando eu toco em <~ok>
  e eu toco em {Confirm}
```

## `uncheck`

```gherkin
Então eu desmarco {Foo}
  e eu desmarco <#bar>
```

## `wait`

```gherkin
Então eu espero 2 segundos
  e eu aguardo 3 segundos
```

```gherkin
Então eu espero por {Foo}
  e eu espero <#bar> por 2 segundos
```

```gherkin
Então eu espero {Foo} ficar habilitado
  e eu espero por <#bar> ficar habilitado
```

```gherkin
Então eu espero {Foo} ficar invisível
  e eu espero por <#bar> ficar invisível
```

```gherkin
Então eu espero {Foo} ficar visível
  e eu espero por <#bar> ficar visível
```

```gherkin
Então eu espero pelo texto "Foo"
```

```gherkin
Então eu espero pela url "/foo"
  e espero pela url "/bar" por 3 segundos
```
