$(function(){
    $.extend($.fn.disableTextSelect = function() {
        return this.each(function(){
            if($.browser.mozilla){//Firefox
                $(this).css('MozUserSelect','none');
            }else if($.browser.msie){//IE
                $(this).bind('selectstart',function(){return false;});
            }else{//Opera, etc.
                $(this).mousedown(function(){return false;});
            }
        });
    });
    $('.noSelect').disableTextSelect();//No text selection on elements with a class of 'noSelect'
});
$( document ).ready(function() {
    var oTable = $("#domainTable").DataTable({
        "scrollY":        "600px",
        "scrollCollapse": true,
        "paging":         true,
        "order": [[ 0, 'asc' ]],
        "createdRow": function ( row, data, index ) {
            $(row).attr('data-index', index).addClass('domainElement newRow');

       },
       "oLanguage":
        {
            "sLengthMenu": "Afficher _MENU_ &eacute;l&eacute;ments",
            "sInfo": "_TOTAL_ entr&eacute;e(s) (_START_ / _END_)",
            "sSearch": "Rechercher",
            "sZeroRecords": "Pas d'&eacute;l&eacute;ment",
            "sInfoEmpty": "Pas d'&eacute;l&eacute;ment",
            "oPaginate":
            {

                "sPrevious": "Page pr&eacute;c&eacute;dente",
                "sNext": "Page suivante"
            }
        }
    });


    /*oTable.on( 'order.dt search.dt', function (i) {
        oTable.rows().nodes()).each(function () {
            $(this).attr('data-index',i+1);
        }
    } ).draw();*/

    $( "#tabs" ).tabs();
    $( "#ajouterDomaine" ).css('cursor', 'pointer');


    $('[contenteditable]').on('focus', function() {
        var $this = $(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur keyup paste', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    });

    var animationSpeed = 300;
    var domainIndex = 0;
    var maxLength = 255;
    var postPublication = '';
    var statutCle = '';
    var certRevoque = '';



    $('#messageHistorique').hide();
    $('#messageAdministration').hide();
    $('#messageErreurCle').hide();
    $('#messageCertRevoque').hide();

    if(postPublication == "success")
    {
        $( "#tabs" ).tabs( "option", "active", 1 );
        $('#messageHistorique').show(animationSpeed);
    }

    if(postPublication == "error")
    {
        $( "#tabs" ).tabs( "option", "active", 0 );
        $('#messageAdministration').show(animationSpeed);
    }

    if(statutCle == "KO")
    {
        $('#messageErreurCle').show(animationSpeed);
    }


    if( certRevoque== "cert_revoque")
    {
        $('#messageCertRevoque').show(animationSpeed);
    }


    function dataToJSON()
    {
        var domainArray = [];
        $(oTable.rows().nodes()).each(function () {
            var domainObject = new Object();

            domainObject.nom = $(this).find('td[data-name="nom"]').text();
            domainObject.description = $(this).find('td[data-name="description"]').text();
            domainObject.DNCertificatOperateur = $(this).find('td[data-name="dNCertificatOperateur"]').text();
            domainObject.DNCertificatOperateur = $(this).find('td[data-name="responsableContact"]').text();
            domainObject.DNCertificatOperateur = $(this).find('td[data-name="supportContact"]').text();
            var dateMaj = $(this).find('td[data-name="dateMaj"]').text();

            //Si la dateMaj est vide, il s'agit d'un nouveau domaine
            if(dateMaj != "")
            {
                domainObject.dateMaj = dateMaj;
            }
            else
            {
                domainObject.dateMaj =  moment().format('YYYY-MM-DD HH:mm:ss');
            }

            domainArray.push(domainObject);
        });

        $('input[name="nouvelleListeBlancheJSON"]').val(JSON.stringify(domainArray));

    }

    $('#visualiserIGCCPSXML').click(function()
    {
        dataToJSON();
        $('form').attr('action','visualiserListeBlancheIGCCPSXML');
        $('form').attr('target','_blank');
        $('form').submit();
    });

    $('#visualiserIGCSANTEXML').click(function()
    {
        dataToJSON();
        $('form').attr('action','visualiserListeBlancheIGCSante');
        $('form').attr('target','_blank');
        $('form').submit();
    });



    //Fleche de depliement
    $('#domainTable').on("click", "i.arrow",function()
    {
        $(this).parent().parent().parent().find('.toggleableRows').slideToggle(animationSpeed);
        if($(this).hasClass('fa-caret-right'))
        {
            $(this).removeClass('fa-caret-right').addClass('fa-caret-down');
        }
        else
        {
            $(this).removeClass('fa-caret-down').addClass('fa-caret-right');
        }
    });

    //Suppression de domaine
    oTable.on("click", "i.delete",function()
    {
        var tr = $(this).closest('tr');
        var dataIndex = tr.attr('data-index');
        popup_domain(dataIndex);
    });

    //Publication
    $('#signerPublier').click(function()
    {
        popup_publication();
    });

    function popup_domain(index)
    {
        $("#popup-delete-domain").dialog({
            resizable: false,
            width: 300,
            height:170,
            modal: true,
            open: function (event, ui) {
                $('#popup-delete-domain').css('overflow', 'hidden'); //pas de scroll bar
            },
            buttons: {
                "OK": function()
                {
                    $(":animated").promise().done(function() {
                    });
                    removeDomain(index);
                    $( this ).dialog( "close" );
                },
                "Annuler": function()
                {
                    $( this ).dialog( "close" );
                }
            }
        });
    }




    //On cache les messages à chaque changement de tab
    $('#tabs').on('tabsactivate', function(event, ui) {
        $('#messageHistorique').hide();
        $('#messageErreurCle').hide();
        $('#messageAdministration').hide();
    });

    function popup_publication()
    {
        $("#popup-publication").dialog({
            resizable: false,
            width: 450,
            height: 350,
            modal: true,
            open: function (event, ui) {
                $('#popup-publication').css('overflow', 'hidden'); //pas de scroll bar
                //  $('#confirmerPublication').show();
                $('#commentaire').show();
                $('#commentaireTextarea').val('');
                $('#cleInput').val('');
            },
            buttons: {
                "OK": function()
                {
                    $(":animated").promise().done(function() {
                        if($('#commentaire').is(':visible'))
                        {
                            //Envoyer commentaire
                            $('#popup-publication').dialog( "close" );
                            var commentaire = $('#commentaireTextarea').val();
                            $('input[name="commentaire"]').val(commentaire);
                            var cle = $('#cleInput').val();
                            $('input[name="cle"]').val(cle);
                            dataToJSON();
                            $('form').attr('action','publier');
                            $('form').removeAttr('target');
                            $('form').submit();

                        }
                        else
                        {
                            $('#confirmerPublication').hide(animationSpeed);
                            $('#commentaire').show(animationSpeed);
                        }

                    });
                },
                "Annuler": function()
                {
                    $( this ).dialog( "close" );
                }
            }
        });
    }

    function removeDomain(index)
    {
        newIdx = domainIndex-1;
        if (newIdx > 0) {
            newIdx--
        }
        oTable.row(index).remove().draw();
        pos = oTable.rows()[0].indexOf(newIdx);
        page = Math.floor(pos / oTable.page.info().length);
        oTable.page(page).draw();
        updateDomainCount();
    }

    $('#popup-delete-domain').hide();
    $('#popup-publication').hide();


    $(".domainElement .descriptionCol[data-name=dNCertificatOperateur]").each(function(Key,value){
        $(this).bind( "DOMSubtreeModified", function() {
            //Compteur
            updateDomainCount();
        });
    })


    /* $(".floatedCell").css("min-height", function() {
        return $(this).height();
    });*/

    function setEndOfContenteditable(contentEditableElement)
    {
        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        {
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
    }


    function updateDomainCount()
    {
        //$('#domainCount').text($('.domainElement').length);
        var org = $('#organization').val();
        var aaSize=0;
        var bbSize=0;
        $(oTable.rows().nodes()).each(function () {
            var DNCertificat = $(this).find('td[data-name="dNCertificatOperateur"]').text();

            if(DNCertificat.includes('CN='+org)){
                aaSize++;
            }
            else{
                bbSize++;
            }
        });
        $('#domainCount').text(aaSize+ " (AA) - "+bbSize +" (BB)");
        oTable.columns.adjust().draw();
    }

    function adaptHeight(cells, height)
    {
        $(cells).animate({ height: height }, animationSpeed);
    }

    var placeholder = "_";

    $('#domainTable').on("dblclick", ".editableCell",function(){
        if ($(this).text() == placeholder) {
            $(this).text("");
        }
        $(this).css("color", $('body').css('color'));
        $(this).attr('contentEditable', 'true');
        $(this).addClass('editable');
        setEndOfContenteditable($(this).get(0));
        adaptHeight($(this).parent().find('.floatedCell'), '100%');
        $(this).focus();
    });

    $('#domainTable').on("blur", ".editableCell",function(){
        $(this).attr('contentEditable', 'false');
        $(this).removeClass('editable');
        adaptHeight($(this), '100%');
        if($(this).text() == "")
        {
            $('.editableCell:empty').text(placeholder).css("color", $(this).css('background-color'));
        }
    });

    $('#domainTable').on("keydown", ".editableCell",function(event){
        if (event.which == '13') {
            event.preventDefault();
            $('.editableCell').blur();
        }
        else
        {
            //On empêche toute entrée clavier sauf del et backspace
            //tab, shift, ctrl, alt
            //fleches directionelles
            //raccourcis
            if($(this).html().length >= maxLength && event.which != '46' && event.which != '8'
                && event.which != '9' && event.which != '16' && event.which != '17' && event.which != '18'
                && event.which != '37' && event.which != '38' && event.which != '39' && event.which != '40'
                && !(event.ctrlKey && (event.which == '65' || event.which == '67' || event.which == '86' || event.which == '88'))
            )
            {
                event.preventDefault();
            }
        }
    });

    $('#domainTable').on("paste", ".editableCell",function(event){
        if($(this).text().length >= 255){
            event.preventDefault();
        }
        var cell = $(this);
        var cellOldText = cell.text();

        var pasteText = (event.originalEvent.clipboardData || event.clipboardData).getData('text/plain');

        //Si chrome, pas besoin de copier coller sinon copie en double

        // document.execCommand('insertText', false, pasteText);

        if(pasteText.length > maxLength){
            var newText = pasteText.substring(0, maxLength);
            event.preventDefault();
            cell.text(newText);
        }
        var pasteTextLength = pasteText.length;
        var textLength = cellOldText.length;
        if(pasteTextLength + textLength > maxLength){
            var newText = cellOldText + pasteText.substring(0, maxLength - textLength);
            event.preventDefault();
            cell.text(newText);
        }

    });

    $('#domainTable').on("DOMSubtreeModified", ".editableCell",function(event)
    {
        if($(this).text().length > 255)
        {
            $(this).text($(this).text().substring(0,maxLength));
        }
    });

    function check_charcount(content_id, max, e)
    {
        if(e.which != 8 && $('#'+content_id).text().length > max)
        {
            e.preventDefault();
        }
    }

    $('.editableCell').blur();

    $('#ajouterDomaine').click(function()
    {
        var row = oTable.row.add( [ '', '', '', '' , '', '', ''] ).draw();
        var node = row.node();

        $(row).attr('data-index', domainIndex);
        $(row).addClass('domainElement newRow');
        $( node ).find('td').eq(0).addClass('editableCell descriptionCol').attr("data-name", "nom");
        $( node ).find('td').eq(1).addClass('editableCell descriptionCol').attr("data-name", "description");;
        $( node ).find('td').eq(2).addClass('editableCell descriptionCol').attr("data-name", "dNCertificatOperateur");;
        $( node ).find('td').eq(3).addClass('editableCell descriptionCol').attr("data-name", "responsableContact");;
        $( node ).find('td').eq(4).addClass('editableCell descriptionCol').attr("data-name", "supportContact");;
        $( node ).find('td').eq(5).addClass('descriptionCol');
        $( node ).find('td').eq(6).addClass("deleteCol").html('<i class="delete fa fa-times fa-lg"></i>');
        $( node ).find('td').eq(0).dblclick().focus();
        domainIndex++;
        oTable.columns.adjust().draw();
    });

    //Ajout index sur les domaines initiaux
    $(oTable.rows().nodes()).each(function () {
        domainIndex++;
    });
    


    updateDomainCount();
    $('.fileLink').click(function()
    {
        $('form').attr('action','lienFichier');
        $('form').attr('target','_blank');
        $('input[name="nomFichier"]').val($(this).data('file'));
        $('form').submit();

    });





});
