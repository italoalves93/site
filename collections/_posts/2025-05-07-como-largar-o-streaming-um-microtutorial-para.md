---
layout: post
title: Como largar o streaming
date: '2025-05-07T16:43:22-05:00'
categories:
  - Português
tumblr_url: >-
  https://peripatetico.tumblr.com/post/782923677191766016/como-largar-o-streaming-um-microtutorial-para
description: Um microtutorial para leigos
image: >-
  https://64.media.tumblr.com/f834f42b54091f4380135c24d29968d1/af679303464630c4-93/s640x960/97954d0da98a0e5872c74e65a57c150e5be951b1.png
---

Há um bom tempo venho querendo fugir da atmosfera do streaming comercial—Spotify, Netflix, Amazon Prime, Max, etc. Tenho motivos tanto financeiros (muito caro pagar tudo isso), políticos (sou contra não ser dono dos arquivos das coisas que assisto, ouço e leio) e morais (essas empresas são fundamentalmente más).

Também simpatizo com o universo do compartilhamento peer-to-peer, talvez por nostalgia da época em que precisava baixar os mp3 no Kazaa e no eMule, passar pelo Diet MP3 para diminuir o tamanho dos arquivos e transferir pro meu mp3 player de 256 MB. Ou seja, gosto do processo de baixar manualmente os meus arquivos. Acho que ele me constrange a pensar um pouco mais sobre o que estou consumindo e me força a conhecer mais os artistas. Além disso, sou a favor de todo tipo de pirataria de bens não escassos (mas isso é lateral—você pode consumir só arquivos pelos quais pagou, se preferir).

![](https://64.media.tumblr.com/f834f42b54091f4380135c24d29968d1/af679303464630c4-93/s640x960/97954d0da98a0e5872c74e65a57c150e5be951b1.png)

_Fonte: Appgefahren.de_

Por esses motivos, decidi, já tem algum tempo, voltar a baixar as coisas que ouço e a que assisto. Comecei com o seguinte setup: Comprei um laptop caquético por literalmente 5 dólares para deixar rodando ligado na rede de casa. Nele, espetei um HD externo também antigo e instalei o Plex, um programa que não só organiza os seus arquivos (acha legenda automaticamente, adiciona informações sobre atores, diretor, etc., organiza tudo bonitinho) como também deixa você streamar eles para os seus dispositivos. Passei então a baixar filmes e séries nele e assistir pela minha TV, celular e tablet.

Mais recentemente, decidi que queria fazer isso com música também. Mas esse meu laptop velho tava muito ruim e decidi comprar um computador um pouquinho melhor para usar como servidor. Como acho que esse ímpeto de largar o streaming é mais ou menos compartilhado, decidi escrever esse tutorialzinho para ajudar quem quer fazer o mesmo. Eu não manjo muito de tecnologia, e boa parte da dificuldade do processo de migrar para uma alternativa ao streaming, na minha experiência, é o longo processo de deixar tudo organizado e funcionando do jeito que deveria, então acho que um tutorial de um leigo escrito para outros leigos pode ser útil.

Minha explicação é específica para o meu setup, então talvez você tenha que adaptar para o seu, e ela só vai até certo nível de detalhe—talvez você também precise procurar respostas para suas perguntas mais específicas. Na dúvida, fala comigo ([@italoalves](https://tmblr.co/MYOg1FJTfrfTbIeNNtfL8Mw)[.com](https://bsky.app/profile/italoalves.com) no Bluesky). Não garanto que vou saber ajudar, mas posso tentar.

# Hardware

Você vai precisar de:

- Um computador conectado à internet
- Alguma forma de armazenamento (por exemplo, um HD externo)

Fundamentalmente, para deixar a coisa rodando, você precisa de um computador por onde vão entrar os arquivos que você for baixar e uma forma de armazenamento onde os arquivos vão morar. No meu caso, tenho um **mini computador** (um Dell Optiplex Ultra Small). Ele não tem wi-fi, então fica espetado direto no roteador, sem monitor, teclado ou mouse. É só uma caixa que fica lá. (Dá também para fazer com o seu computador principal. Porém, no meu caso essa não era uma opção tão boa, já que meu computador principal é um laptop que tá sempre de um lado pro outro, e eu não queria ficar conectando e desconectando o HD externo toda vez que quisesse baixar ou assistir a algo.)

Nesse computador, deixo conectado um **HD externo** de 1 TB. É um tamanho razoável, mas dependendo do tamanho que você quer deixar a sua biblioteca, pode ser pouco. Para música, no meu caso, é mais do que suficiente. Com os filmes e séries eu não me importo tanto, então não me importaria de eventualmente ter que começar a deletar os filmes que já vi. Gente mais profissional diz que HD externo é uma opção mais ou menos improvisada. O IDEAL seria ter HDs internos ou um NAS (network-attached storage). Por enquanto não vejo muita necessidade (nem quero gastar o dinheiro) de mudar para alguma coisa mais profissional.

Enfim: ligue o computador na tomada, ligue ele na internet e espete um HD externo antes de ir para o próximo passo.

# Instalando o Plex

Você vai precisar:

- Baixar um servidor do [Plex](https://plex.tv/) para o computador onde moram os seus arquivos
- Baixar aplicativos do Plex onde você vai assistir/ouvir os seus arquivos (TV, celular, tablet, etc.). Os de vídeo se chamam “Plex”. O de música, “Plexamp"

O que vai fazer você poder streamar os seus arquivos que moram no seu computador vai ser um programa chamado Plex. Você vai precisar baixar a versão “servidor” dele para deixar rodando no seu computador-servidor. Depois de instalar, você vai poder selecionar pastas no seu HD externo que você quer streamar. No meu caso, eu deixo uma pasta única para séries e filmes e outra separada para música. No Plex, você adiciona uma biblioteca (por exemplo, “Séries”) e seleciona a pasta dentro do seu HD externo onde vão estar as séries. Eu uso séries e filmes na mesma pasta porque o Plex normalmente distingue elas direitinho, então não preciso fazer isso manualmente.

O Plex tem uma “learning curve”. No começo parece meio difícil, mas tem muito tutorial na internet, então recomendo dar uma procurada se as coisas ficarem confusas. Instalado o Plex no seu servidor, você já pode sair streamando as coisas. Faça login com a mesma conta nos aplicativos do Plex nos seus dispositivos e pronto. Você já tem uma espécie de streaming particular.

# Baixando os arquivos

Você vai precisar de:

- [Soulseek](https://www.slsknet.org/news/node/1)
- [qBittorrent](https://www.qbittorrent.org/)
- Sites de torrent (eztv, 1337x, etc.)

Instalada a infraestrutura, você vai precisar popular a sua biblioteca. Eu uso principalmente duas formas. Uma é o **Soulseek** , um programa de compartilhamento peer-to-peer em que você procurar por basicamente qualquer arquivo que algum outro usuário do Soulseek tenha compartilhado. Eu uso principalmente para música. Você procura o que quer e ele te mostra uma lista de matches para a sua busca—arquivos ou pastas que aparecem com o mesmo nome em algum outro usuário. Aí você pode selecionar os arquivos que quiser e baixar para seu computador. Lembre-se de baixá-los para a mesma pasta em que você disse para o Plex que os seus arquivos estariam. Se suas músicas vão estar em, por exemplo, “E:/Plex/Musicas”, baixe para este destino (tem como mudar nas configurações). Você também pode (e deve, moralmente falando) compartilhar os seus arquivos para outros usuários baixarem. Apenas cuidado para não compartilhar arquivos pessoais, fotos, etc.

Filmes e séries eu normalmente baixo por torrent. Também tem uma learning curve, mas é uma tecnologia muito bem servida de tutoriais na internet. A diferença para o Soulseek é que, em vez de você baixar o arquivo diretamente da pasta de um outro usuário, com o torrent você baixa pedaços do arquivo de vários usuários simultaneamente. Você deve começar em um agregador de torrents, como o EZTV (para séries de TV), o 1337x, para filmes, ou outros trackers privados, como o CinemaZ, que podem ter torrents mais difíceis de achar, mas que também são mais difíceis de acessar, às vezes precisando de convite.

As formas de popular sua biblioteca são virtualmente infinitas. Você pode também copiar seus CDs, ou incluir as coisas que você baixou do Bancamp, etc.

# Acessando o computador remotamente

Você vai precisar de:

- Windows App
- Um outro computador
- Várias horas para gastar procurando respostas na internet

Como falei, meu computador fica ligado no roteador sem teclado, mouse ou monitor. Como então baixar as coisas para ele? A resposta irá lhe surpreender!

A resposta é: depende. O qBittorrent é o cliente de torrent que eu uso por duas razões: uma, é um servidor recomendado por um tracker privado que eu uso. Outra, ele tem uma interface web, o que significa que eu posso incluir os torrents usando o meu laptop. Precisa configurar isso no qBittorrent, mas é relativamente fácil. Só talvez você precise permitir que o qBittorrent passe por cima do firewall do seu computador. Demorei algumas horas para enter isso, mas funcionou. Procure essas palavras-chave no Google para achar tutoriais.

O qBittorrent tem uma versão Web. Agora, para mexer nos arquivos eles mesmos, eu posso acessar o HD externo também remotamente pelo meu laptop. A forma específica de fazer isso vai depender do seu sistema operacional. Provavelmente você vai precisar saber o IP do seu computador-servidor, o que você pode descobrir indo nas configurações de rede.

O Soulseek é um pouco mais chato porque ele não tem uma interface web, o que torna meio impossível mexer nele remotamente. O que eu faço no meu caso é acessar o computador-servidor do meu laptop através do Windows App. Você só precisa saber o nome do computador e entrar com o email e senha que você usa para fazer login nele. Se você não usa email e senha, aparentemente tem que configurar um. Não consegui de outra forma. No Windows App, você basicamente mexe no seu computador remotamente, vendo todas coisas que veria na tela se tivesse um monitor espetado. É uma espécie de monitor remoto.

Alternativamente, você pode rodar o Soulseek no seu laptop/segundo computador e mandar ele baixar os arquivos para a pasta que está no HD externo do seu computador-servidor. Isso para mim não era uma boa opção porque, se eu saio de casa com meu laptop, as coisas do Soulseek páram de baixar.

# VPN

Você vai precisar de:

- Um VPN

Importante lembrar que, se você mora em uma jurisdição que complica com pirataria, é bom instalar um VPN tanto no computador-servidor quanto no seu laptop/segundo computador. Eu uso o Mullvad, mas tem vários outros. Tem que também configurar para que ele permita que a rede doméstica ignore o VPN (é uma opção nas configurações e é só apertar o botão para ligar).

# Vendo filmes e ouvindo músicas

Com esse setting pronto, você pode ouvir as suas músicas e ver os seus filmes no conforto da sua casa e inclusive fora dela. É possível também compartilhar a sua biblioteca com outras pessoas, embora eu ainda não tenha feito isso.

Comecei há pouco a baixar músicas, e por isso ainda não me desfiz do Spotify, mas já, finalmente, deixei de pagar streamings de vídeo. Quando quero ver algo, baixo o torrent e depois ligo a TV, atualizo a biblioteca, e abro o filme. O Plex normalmente puxa legendas automaticamente que ele acha na internet.
