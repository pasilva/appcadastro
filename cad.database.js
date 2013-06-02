var localDB = null;

function onInit(){
    try {
        if (!window.openDatabase) {
            updateStatus("Erro: Seu navegador não permite banco de dados.");
        }
        else {
            initDB();
            createTables();
            queryAndUpdateOverview();
        }
    } 
    catch (e) {
        if (e == 2) {
            updateStatus("Erro: Versão de banco de dados inválida.");
        }
        else {
            updateStatus("Erro: Erro desconhecido: " + e + ".");
        }
        return;
	}
}
		
function initDB(){
    var shortName = 'mynewDB';
    var version = '1.0';
    var displayName = 'MynewDB';
    var maxSize = 65536; // Em bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables () { 
		var query= 'CREATE TABLE IF NOT EXISTS cad_prod (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR NOT NULL, descricao VARCHAR NOT NULL, modalidade VARCHAR NOT NULL, categoria VARCHAR NOT NULL, marca VARCHAR NOT NULL, preco VARCHAR NOT NULL);';
		try {
			localDB.transaction(function(transaction){
			transaction.executeSql(query, [], nullDataHandler, errorHandler);
			updateStatus("Tabela 'cad_prod' status: OK.");
        });
    } 
		catch (e) {
        updateStatus("Erro: Data base 'cad_prod' não criada " + e + ".");
        return;
    }
}

function onUpdate(){
    var id = document.itemForm.id.value;
    var nome = document.itemForm.nome.value;
    var descricao = document.itemForm.descricao.value;
	var modalidade = document.itemForm.modalidade.value;
	var categoria = document.itemForm.categoria.value;
	var marca = document.itemForm.marca.value;
	var preco = document.itemForm.preco.value;
    if (nome == "" || descricao == "" || modalidade == "" || categoria == "" || marca == "" || preco == "") {
        updateStatus("Erro: Preencher todos os Campos!");
    }
	else {
        var query = "update cad_prod set nome=?, descricao=?, modalidade=?, categoria=?, marca=?, preco=? where id=?;";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [nome, descricao, modalidade, categoria, marca, preco, id], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Update não realizado.");
                    }
                    else {
                        updateForm("", "", "", "", "", "", "");
                        updateStatus("Alterado com sucesso:" + results.rowsAffected);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: UPDATE não realizado " + e + ".");
        }
    }
}

function onDelete(){
    var id = document.itemForm.id.value;
    
    var query = "delete from cad_prod where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
                if (!results.rowsAffected) {
                    updateStatus("Erro: Insucesso ao deletar.");
                }
                else {
                    updateForm("", "", "", "", "", "", "");
                    updateStatus("Linhas deletadas:" + results.rowsAffected);
                    queryAndUpdateOverview();
                }
            }, errorHandler);
        });
    } 
    catch (e) {
        updateStatus("Erro: DELETE não realizado " + e + ".");
    }
    
}

function onCreate(){
    var nome = document.itemForm.nome.value;
    var descricao = document.itemForm.descricao.value;
	var modalidade = document.itemForm.modalidade.value;
	var categoria = document.itemForm.categoria.value;
	var marca = document.itemForm.marca.value;
	var preco = document.itemForm.preco.value;
    if (nome == "" || descricao == "" || modalidade == "" || categoria == "" || marca == "" || preco == "") {
        updateStatus("Erro: Preencher todos os Campos!");
    }
    else {
        var query = "insert into cad_prod (nome, descricao, modalidade, categoria, marca, preco) VALUES (?, ?, ?, ?, ?, ?);";
        try {
            localDB.transaction(function(transaction){
                transaction.executeSql(query, [nome, descricao, modalidade, categoria, marca, preco], function(transaction, results){
                    if (!results.rowsAffected) {
                        updateStatus("Erro: Insucesso ao inserir");
                    }
                    else {
                        updateForm("", "", "", "", "", "", "");
                        updateStatus("Inserido com sucesso, linha id: " + results.insertId);
                        queryAndUpdateOverview();
                    }
                }, errorHandler);
            });
        } 
        catch (e) {
            updateStatus("Erro: INSERT não realizado " + e + ".");
        }
    }
}

function onSelect(htmlLIElement){
	var id = htmlLIElement.getAttribute("id");
	
	query = "SELECT * FROM cad_prod where id=?;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [id], function(transaction, results){
            
                var row = results.rows.item(0);
                
                updateForm(row['id'], row['nome'], row['descricao'], row['modalidade'], row['categoria'], row['marca'], row['preco']);
                
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
   
}

function queryAndUpdateOverview(){

	    var dataRows = document.getElementById("itemData").getElementsByClassName("data");
	
    while (dataRows.length > 0) {
        row = dataRows[0];
        document.getElementById("itemData").removeChild(row);
    };
	
	var query = "SELECT * FROM cad_prod;";
    try {
        localDB.transaction(function(transaction){
        
            transaction.executeSql(query, [], function(transaction, results){
                for (var i = 0; i < results.rows.length; i++) {
                
                    var row = results.rows.item(i);
                    var ul = document.createElement("ul");
					ul.setAttribute("id", row['id']);
                    ul.setAttribute("class", "data");
                    ul.setAttribute("onclick", "onSelect(this)");
                    
                    var ulText = document.createTextNode(row['nome'] + " | "+ row['descricao'] + " | "+ row['modalidade'] + " | "+ row['categoria'] + " | "+ row['marca'] + " | "+ row['preco']);
                    ul.appendChild(ulText);
                    
                    document.getElementById("itemData").appendChild(ul);
                }
            }, function(transaction, error){
                updateStatus("Erro: " + error.code + "<br>Mensagem: " + error.message);
            });
        });
    } 
    catch (e) {
        updateStatus("Error: SELECT não realizado " + e + ".");
    }
}

errorHandler = function(transaction, error){
    updateStatus("Erro: " + error.message);
    return true;
}

nullDataHandler = function(transaction, results){
}

function updateForm(id, nome, descricao, modalidade, categoria, marca, preco){
    document.itemForm.id.value = id;
    document.itemForm.nome.value = nome;
    document.itemForm.descricao.value = descricao;
	document.itemForm.modalidade.value = modalidade;
	document.itemForm.categoria.value = categoria;
	document.itemForm.marca.value = marca;
	document.itemForm.preco.value = preco;
}

function updateStatus(status){
    document.getElementById('status').innerHTML = status;
}
